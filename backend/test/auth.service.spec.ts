import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "../src/auth/auth.service";
import { PasswordService } from "../src/auth/password.service";
import { RefreshSession } from "../src/auth/refresh-session.entity";
import { Organization } from "../src/organizations/organization.entity";
import { User } from "../src/users/user.entity";
import { UserRole } from "../src/users/user-role.enum";

const createUser = (overrides: Partial<User> = {}): User =>
  ({
    id: "user-1",
    email: "user@example.com",
    passwordHash: "hash",
    firstName: "Ada",
    lastName: "Lovelace",
    organizationId: "org-1",
    role: UserRole.Owner,
    ...overrides
  }) as User;

const createService = () => {
  const users = new Map<string, User>();
  const refreshSessions = new Map<string, RefreshSession>();
  const organizations = new Map<string, Organization>();

  const usersRepository = {
    findOne: jest.fn(async ({ where }: { where: Partial<User> }) => {
      if (where.email) {
        return Array.from(users.values()).find((user) => user.email === where.email) ?? null;
      }

      if (where.id) {
        return users.get(where.id) ?? null;
      }

      return null;
    }),
    create: jest.fn((value: Partial<User>) => value as User),
    save: jest.fn(async (user: User) => {
      const savedUser = { ...user, id: user.id ?? "user-1" } as User;
      users.set(savedUser.id, savedUser);
      return savedUser;
    })
  };

  const organizationsRepository = {
    exists: jest.fn(async ({ where }: { where: Partial<Organization> }) =>
      Array.from(organizations.values()).some((organization) => organization.key === where.key)
    ),
    create: jest.fn((value: Partial<Organization>) => value as Organization),
    save: jest.fn(async (organization: Organization) => {
      const savedOrganization = { ...organization, id: organization.id ?? "org-1" } as Organization;
      organizations.set(savedOrganization.id, savedOrganization);
      return savedOrganization;
    })
  };

  const refreshSessionsRepository = {
    findOne: jest.fn(async ({ where, relations }: { where: Partial<RefreshSession>; relations?: { user: boolean } }) => {
      const session =
        Array.from(refreshSessions.values()).find((value) => value.tokenHash === where.tokenHash) ?? null;

      if (session && relations?.user) {
        session.user = users.get(session.userId) as User;
      }

      return session;
    }),
    create: jest.fn((value: Partial<RefreshSession>) => value as RefreshSession),
    save: jest.fn(async (session: RefreshSession) => {
      const savedSession = { ...session, id: session.id ?? `session-${refreshSessions.size + 1}` } as RefreshSession;
      refreshSessions.set(savedSession.id, savedSession);
      return savedSession;
    }),
    update: jest.fn()
  };

  const manager = {
    getRepository: (entity: unknown) => {
      if (entity === Organization) {
        return organizationsRepository;
      }

      return usersRepository;
    }
  };

  const dataSource = {
    transaction: jest.fn((callback: (value: typeof manager) => Promise<unknown>) => callback(manager))
  };

  const passwordService = {
    hash: jest.fn(async () => "argon2-hash"),
    verify: jest.fn(async () => true)
  };

  const configService = new ConfigService({
    JWT_SECRET: "access-secret",
    JWT_ACCESS_TOKEN_TTL: "15m",
    REFRESH_TOKEN_SECRET: "refresh-secret",
    REFRESH_TOKEN_TTL_DAYS: "30"
  });

  const service = new AuthService(
    configService,
    dataSource as never,
    new JwtService(),
    passwordService as unknown as PasswordService,
    usersRepository as never,
    organizationsRepository as never,
    refreshSessionsRepository as never
  );

  return {
    dataSource,
    organizations,
    organizationsRepository,
    passwordService,
    refreshSessions,
    refreshSessionsRepository,
    service,
    users,
    usersRepository
  };
};

describe("AuthService", () => {
  it("creates an organization and owner during registration", async () => {
    const { organizations, refreshSessions, service, users } = createService();

    const session = await service.register({
      email: "USER@EXAMPLE.COM",
      password: "password123",
      firstName: "Ada",
      lastName: "Lovelace",
      organizationName: "Acme Corporation"
    });

    expect(session.user.email).toBe("user@example.com");
    expect(session.user.role).toBe(UserRole.Owner);
    expect(session.accessToken).toEqual(expect.any(String));
    expect(session.refreshToken).toEqual(expect.any(String));
    expect(Array.from(organizations.values())[0]).toMatchObject({ name: "Acme Corporation", key: "acme-corporation" });
    expect(Array.from(users.values())[0].passwordHash).toBe("argon2-hash");
    expect(refreshSessions.size).toBe(1);
  });

  it("rejects duplicate registration emails", async () => {
    const { service, users } = createService();
    users.set("user-1", createUser());

    await expect(
      service.register({
        email: "user@example.com",
        password: "password123",
        firstName: "Ada",
        lastName: "Lovelace",
        organizationName: "Acme"
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("logs in with valid credentials and rejects invalid credentials", async () => {
    const { passwordService, service, users } = createService();
    users.set("user-1", createUser({ passwordHash: "stored-hash" }));

    await expect(service.login({ email: "user@example.com", password: "password123" })).resolves.toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        id: "user-1"
      }
    });

    passwordService.verify.mockResolvedValueOnce(false);

    await expect(service.login({ email: "user@example.com", password: "wrong" })).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });

  it("rotates refresh tokens and rejects reused tokens", async () => {
    const { refreshSessions, service, users } = createService();
    users.set("user-1", createUser());
    const loginSession = await service.login({ email: "user@example.com", password: "password123" });

    const refreshedSession = await service.refresh(loginSession.refreshToken);

    expect(refreshedSession.refreshToken).not.toBe(loginSession.refreshToken);
    expect(Array.from(refreshSessions.values()).filter((session) => session.revokedAt).length).toBe(1);
    await expect(service.refresh(loginSession.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("revokes refresh session on logout", async () => {
    const { refreshSessions, service, users } = createService();
    users.set("user-1", createUser());
    const loginSession = await service.login({ email: "user@example.com", password: "password123" });

    await service.logout(loginSession.refreshToken);

    expect(Array.from(refreshSessions.values())[0].revokedAt).toBeInstanceOf(Date);
    await expect(service.refresh(loginSession.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("returns current user without sensitive fields", async () => {
    const { service, users } = createService();
    users.set("user-1", createUser());

    await expect(service.getCurrentUser("user-1")).resolves.toEqual({
      id: "user-1",
      email: "user@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      organizationId: "org-1",
      role: UserRole.Owner
    });
    await expect(service.getCurrentUser("missing")).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
