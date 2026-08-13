import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthCookieService } from "./auth-cookie.service";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { AuthResponse } from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthenticatedUser } from "./authenticated-user";
import { JwtAuthGuard } from "./jwt-auth.guard";

type CookieRequest = Request & {
  cookies?: Record<string, string>;
};

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authCookieService: AuthCookieService,
    private readonly authService: AuthService
  ) {}

  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponse> {
    const session = await this.authService.register(dto);
    this.authCookieService.setRefreshCookie(response, session.refreshToken, session.refreshTokenExpiresAt);

    return {
      accessToken: session.accessToken,
      user: session.user
    };
  }

  @Post("login")
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponse> {
    const session = await this.authService.login(dto);
    this.authCookieService.setRefreshCookie(response, session.refreshToken, session.refreshTokenExpiresAt);

    return {
      accessToken: session.accessToken,
      user: session.user
    };
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() request: CookieRequest, @Res({ passthrough: true }) response: Response): Promise<AuthResponse> {
    const session = await this.authService.refresh(request.cookies?.[this.authCookieService.refreshCookieName]);
    this.authCookieService.setRefreshCookie(response, session.refreshToken, session.refreshTokenExpiresAt);

    return {
      accessToken: session.accessToken,
      user: session.user
    };
  }

  @Post("logout")
  @HttpCode(204)
  async logout(
    @Req() request: CookieRequest,
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user?: AuthenticatedUser
  ): Promise<void> {
    await this.authService.logout(request.cookies?.[this.authCookieService.refreshCookieName], user);
    this.authCookieService.clearRefreshCookie(response);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): Promise<AuthResponse["user"]> {
    return this.authService.getCurrentUser(user.id);
  }
}
