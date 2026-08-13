import { Body, Controller, Get, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { getAuditContextFromRequest } from "../audit/audit-context";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { EnvironmentResponse } from "./dto/environment-response.dto";
import { UpdateEnvironmentDto } from "./dto/update-environment.dto";
import { EnvironmentsService } from "./environments.service";

@ApiTags("environments")
@ApiBearerAuth("access-token")
@Controller("projects/:projectId/environments")
@UseGuards(JwtAuthGuard)
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Get()
  @ApiOperation({ summary: "List all environments belonging to a project" })
  @ApiResponse({ status: 200, description: "The list of environments" })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string
  ): Promise<EnvironmentResponse[]> {
    return this.environmentsService.findAll(user, projectId);
  }

  @Patch(":environmentId")
  @ApiOperation({ summary: "Update an environment's fields" })
  @ApiResponse({ status: 200, description: "The updated environment" })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("environmentId") environmentId: string,
    @Body() dto: UpdateEnvironmentDto,
    @Req() request: Request
  ): Promise<EnvironmentResponse> {
    return this.environmentsService.update(user, projectId, environmentId, dto, getAuditContextFromRequest(request));
  }
}
