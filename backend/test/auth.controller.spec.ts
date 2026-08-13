import { AuthController } from "../src/auth/auth.controller";
import { AuthCookieService } from "../src/auth/auth-cookie.service";
import { UserRole } from "../src/users/user-role.enum";

describe("AuthController", () => {
  const user = {
    id: "user-1",
    email: "user@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    organizationId: "org-1",
    role: UserRole.Owner
  };

  it("sets httpOnly refresh cookie on login and omits refresh token from body", async () => {
    const authService = {
      login: jest.fn(async () => ({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        refreshTokenExpiresAt: new Date("2026-09-12T00:00:00.000Z"),
        user
      }))
    };
    const authCookieService = {
      refreshCookieName: "flagforge_refresh",
      setRefreshCookie: jest.fn(),
      clearRefreshCookie: jest.fn()
    };
    const response = {};
    const controller = new AuthController(authCookieService as unknown as AuthCookieService, authService as never);

    const body = await controller.login({ email: "user@example.com", password: "password123" }, response as never);

    expect(authCookieService.setRefreshCookie).toHaveBeenCalledWith(
      response,
      "refresh-token",
      new Date("2026-09-12T00:00:00.000Z")
    );
    expect(body).toEqual({ accessToken: "access-token", user });
    expect(body).not.toHaveProperty("refreshToken");
  });

  it("clears refresh cookie on logout", async () => {
    const authService = {
      logout: jest.fn()
    };
    const authCookieService = {
      refreshCookieName: "flagforge_refresh",
      setRefreshCookie: jest.fn(),
      clearRefreshCookie: jest.fn()
    };
    const response = {};
    const controller = new AuthController(authCookieService as unknown as AuthCookieService, authService as never);

    await controller.logout({ cookies: { flagforge_refresh: "refresh-token" } } as never, response as never, user);

    expect(authService.logout).toHaveBeenCalledWith("refresh-token", user);
    expect(authCookieService.clearRefreshCookie).toHaveBeenCalledWith(response);
  });
});
