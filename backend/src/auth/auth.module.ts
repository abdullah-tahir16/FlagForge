import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Organization } from "../organizations/organization.entity";
import { User } from "../users/user.entity";
import { AuthController } from "./auth.controller";
import { AuthCookieService } from "./auth-cookie.service";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { PasswordService } from "./password.service";
import { RefreshSession } from "./refresh-session.entity";

@Module({
  imports: [PassportModule, JwtModule.register({}), TypeOrmModule.forFeature([Organization, User, RefreshSession])],
  controllers: [AuthController],
  providers: [AuthService, AuthCookieService, JwtStrategy, PasswordService],
  exports: [AuthService]
})
export class AuthModule {}
