import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";

type SameSite = "lax" | "strict" | "none";

@Injectable()
export class AuthCookieService {
  constructor(private readonly configService: ConfigService) {}

  get refreshCookieName(): string {
    return this.configService.get<string>("REFRESH_TOKEN_COOKIE_NAME") ?? "flagforge_refresh";
  }

  setRefreshCookie(response: Response, refreshToken: string, expiresAt: Date): void {
    response.cookie(this.refreshCookieName, refreshToken, {
      httpOnly: true,
      secure: this.isSecureCookie(),
      sameSite: this.sameSite(),
      expires: expiresAt,
      path: "/api/v1/auth"
    });
  }

  clearRefreshCookie(response: Response): void {
    response.clearCookie(this.refreshCookieName, {
      httpOnly: true,
      secure: this.isSecureCookie(),
      sameSite: this.sameSite(),
      path: "/api/v1/auth"
    });
  }

  private isSecureCookie(): boolean {
    return this.configService.get<string>("REFRESH_TOKEN_COOKIE_SECURE") === "true";
  }

  private sameSite(): SameSite {
    const value = this.configService.get<string>("REFRESH_TOKEN_COOKIE_SAME_SITE") ?? "lax";

    if (value === "strict" || value === "none") {
      return value;
    }

    return "lax";
  }
}
