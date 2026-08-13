import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { createHmac, randomBytes } from "node:crypto";
import { DataSource, IsNull, Repository } from "typeorm";
import { createKeyFromName } from "../common/fns/create-key-from-name";
import { Organization } from "../organizations/organization.entity";
import { User } from "../users/user.entity";
import { UserRole } from "../users/user-role.enum";
import { AuthenticatedUser } from "./authenticated-user";
import { AuthResponse, AuthUserResponse } from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { PasswordService } from "./password.service";
import { RefreshSession } from "./refresh-session.entity";

interface SessionResult extends AuthResponse {
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>,
    @InjectRepository(RefreshSession)
    private readonly refreshSessionsRepository: Repository<RefreshSession>
  ) {}

  async register(dto: RegisterDto): Promise<SessionResult> {
    const email = this.normalizeEmail(dto.email);
    const existingUser = await this.usersRepository.findOne({ where: { email } });

    if (existingUser) {
      throw new ConflictException("A user with this email already exists");
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    const user = await this.dataSource.transaction(async (manager) => {
      const organizationRepository = manager.getRepository(Organization);
      const userRepository = manager.getRepository(User);

      const organization = organizationRepository.create({
        name: dto.organizationName.trim(),
        key: await this.createUniqueOrganizationKey(dto.organizationName.trim())
      });
      const savedOrganization = await organizationRepository.save(organization);

      const newUser = userRepository.create({
        email,
        passwordHash,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        organizationId: savedOrganization.id,
        role: UserRole.Owner
      });

      return userRepository.save(newUser);
    });

    return this.createSession(user);
  }

  async login(dto: LoginDto): Promise<SessionResult> {
    const user = await this.usersRepository.findOne({ where: { email: this.normalizeEmail(dto.email) } });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isValidPassword = await this.passwordService.verify(user.passwordHash, dto.password);

    if (!isValidPassword) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.createSession(user);
  }

  async refresh(refreshToken: string | undefined): Promise<SessionResult> {
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token is required");
    }

    const tokenHash = this.hashRefreshToken(refreshToken);
    const session = await this.refreshSessionsRepository.findOne({
      where: { tokenHash },
      relations: { user: true }
    });

    if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException("Refresh token is invalid");
    }

    session.revokedAt = new Date();
    await this.refreshSessionsRepository.save(session);

    return this.createSession(session.user);
  }

  async logout(refreshToken: string | undefined, user?: AuthenticatedUser): Promise<void> {
    if (!refreshToken && !user) {
      return;
    }

    if (refreshToken) {
      const session = await this.refreshSessionsRepository.findOne({
        where: { tokenHash: this.hashRefreshToken(refreshToken) }
      });

      if (session && !session.revokedAt) {
        session.revokedAt = new Date();
        await this.refreshSessionsRepository.save(session);
      }

      return;
    }

    if (user) {
      await this.refreshSessionsRepository.update(
        { userId: user.id, revokedAt: IsNull() },
        {
          revokedAt: new Date()
        }
      );
    }
  }

  async getCurrentUser(userId: string): Promise<AuthUserResponse> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException("User was not found");
    }

    return this.toUserResponse(user);
  }

  private async createSession(user: User): Promise<SessionResult> {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = this.createRefreshToken();
    const refreshTokenExpiresAt = this.createRefreshExpiry();

    await this.refreshSessionsRepository.save(
      this.refreshSessionsRepository.create({
        userId: user.id,
        tokenHash: this.hashRefreshToken(refreshToken),
        tokenPrefix: refreshToken.slice(0, 12),
        expiresAt: refreshTokenExpiresAt,
        revokedAt: null
      })
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
      user: this.toUserResponse(user)
    };
  }

  private signAccessToken(user: User): Promise<string> {
    return this.jwtService.signAsync(
      {
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      },
      {
        secret: this.configService.get<string>("JWT_SECRET") ?? "change-me-access-secret",
        subject: user.id,
        expiresIn: (this.configService.get<string>("JWT_ACCESS_TOKEN_TTL") ?? "15m") as never
      }
    );
  }

  private createRefreshToken(): string {
    return randomBytes(48).toString("base64url");
  }

  private hashRefreshToken(refreshToken: string): string {
    const secret = this.configService.get<string>("REFRESH_TOKEN_SECRET") ?? "change-me-refresh-secret";

    return createHmac("sha256", secret).update(refreshToken).digest("hex");
  }

  private createRefreshExpiry(): Date {
    const days = Number(this.configService.get<string>("REFRESH_TOKEN_TTL_DAYS") ?? 30);

    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private async createUniqueOrganizationKey(name: string): Promise<string> {
    const baseKey = createKeyFromName(name) || "organization";
    let candidate = baseKey;
    let suffix = 2;

    while (await this.organizationsRepository.exists({ where: { key: candidate } })) {
      candidate = `${baseKey}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toUserResponse(user: User): AuthUserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId
    };
  }
}
