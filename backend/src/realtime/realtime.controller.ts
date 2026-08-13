import { Controller, Get, Req, Res, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Request, Response } from "express";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { RealtimePublisherService } from "./realtime-publisher.service";

interface JwtPayload {
  email: string;
  organizationId: string;
  role: AuthenticatedUser["role"];
  sub: string;
}

@Controller("realtime")
export class RealtimeController {
  private readonly heartbeatIntervalMs = 25000;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly realtimePublisher: RealtimePublisherService
  ) {}

  @Get("events")
  async streamEvents(@Req() request: Request, @Res() response: Response): Promise<void> {
    const user = await this.authenticateRequest(request);

    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache, no-transform");
    response.setHeader("Connection", "keep-alive");
    response.setHeader("X-Accel-Buffering", "no");
    response.flushHeaders?.();

    response.write(": connected\n\n");

    const subscription = this.realtimePublisher.subscribe(user, (frame) => response.write(frame));
    const heartbeat = setInterval(() => {
      response.write(this.realtimePublisher.createHeartbeatFrame());
    }, this.heartbeatIntervalMs);

    request.on("close", () => {
      clearInterval(heartbeat);
      subscription.unsubscribe();
      response.end();
    });
  }

  private async authenticateRequest(request: Request): Promise<AuthenticatedUser> {
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException("Realtime stream requires a bearer token");
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>("JWT_SECRET") ?? "change-me-access-secret"
      });

      return {
        email: payload.email,
        id: payload.sub,
        organizationId: payload.organizationId,
        role: payload.role
      };
    } catch {
      throw new UnauthorizedException("Realtime stream token is invalid or expired");
    }
  }

  private extractBearerToken(request: Request): string | null {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return null;
    }

    const [type, token] = authorization.split(" ");

    return type === "Bearer" && token ? token : null;
  }
}
