import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { EnvironmentResponse } from "./dto/environment-response.dto";
import { UpdateEnvironmentDto } from "./dto/update-environment.dto";
import { EnvironmentsService } from "./environments.service";

@Controller("projects/:projectId/environments")
@UseGuards(JwtAuthGuard)
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string
  ): Promise<EnvironmentResponse[]> {
    return this.environmentsService.findAll(user, projectId);
  }

  @Patch(":environmentId")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("environmentId") environmentId: string,
    @Body() dto: UpdateEnvironmentDto
  ): Promise<EnvironmentResponse> {
    return this.environmentsService.update(user, projectId, environmentId, dto);
  }
}
