import { Controller, Get } from "@nestjs/common";

interface HealthResponse {
  status: "ok";
  service: "flagforge-api";
}

@Controller("health")
export class HealthController {
  @Get()
  check(): HealthResponse {
    return {
      status: "ok",
      service: "flagforge-api"
    };
  }
}
