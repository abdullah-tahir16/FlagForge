import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { getAuditContextFromRequest } from "../audit/audit-context";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateFeatureFlagDto } from "./dto/create-feature-flag.dto";
import { FeatureFlagResponse } from "./dto/feature-flag-response.dto";
import { UpdateEnvironmentFlagConfigDto } from "./dto/update-environment-flag-config.dto";
import { UpdateFeatureFlagDto } from "./dto/update-feature-flag.dto";
import { FeatureFlagsService } from "./feature-flags.service";

@ApiTags("feature-flags")
@ApiBearerAuth("access-token")
@Controller("projects/:projectId/flags")
@UseGuards(JwtAuthGuard)
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @ApiOperation({ summary: "Create a new feature flag in the given project" })
  @ApiResponse({ status: 201, description: "The newly created feature flag, including its (empty) per-environment configs" })
  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Body() dto: CreateFeatureFlagDto,
    @Req() request: Request
  ): Promise<FeatureFlagResponse> {
    return this.featureFlagsService.create(user, projectId, dto, getAuditContextFromRequest(request));
  }

  @ApiOperation({ summary: "List all feature flags belonging to the given project" })
  @ApiResponse({ status: 200, description: "The list of feature flags for the project, including their per-environment configs" })
  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Param("projectId") projectId: string): Promise<FeatureFlagResponse[]> {
    return this.featureFlagsService.findAll(user, projectId);
  }

  @ApiOperation({ summary: "Get a single feature flag by id" })
  @ApiResponse({ status: 200, description: "The requested feature flag, including its per-environment configs" })
  @Get(":flagId")
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("flagId") flagId: string
  ): Promise<FeatureFlagResponse> {
    return this.featureFlagsService.findOne(user, projectId, flagId);
  }

  @ApiOperation({ summary: "Update a feature flag's name and/or description" })
  @ApiResponse({ status: 200, description: "The updated feature flag" })
  @Patch(":flagId")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("flagId") flagId: string,
    @Body() dto: UpdateFeatureFlagDto,
    @Req() request: Request
  ): Promise<FeatureFlagResponse> {
    return this.featureFlagsService.update(user, projectId, flagId, dto, getAuditContextFromRequest(request));
  }

  @ApiOperation({ summary: "Delete a feature flag and all of its per-environment configs" })
  @ApiResponse({ status: 204, description: "The feature flag was deleted" })
  @Delete(":flagId")
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("flagId") flagId: string,
    @Req() request: Request
  ): Promise<void> {
    return this.featureFlagsService.remove(user, projectId, flagId, getAuditContextFromRequest(request));
  }

  @ApiOperation({
    summary: "Update a feature flag's configuration for a specific environment (enabled state, value, and/or rollout percentage)"
  })
  @ApiResponse({ status: 200, description: "The feature flag with its updated per-environment config" })
  @Patch(":flagId/environments/:environmentId")
  updateEnvironmentConfig(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("flagId") flagId: string,
    @Param("environmentId") environmentId: string,
    @Body() dto: UpdateEnvironmentFlagConfigDto,
    @Req() request: Request
  ): Promise<FeatureFlagResponse> {
    return this.featureFlagsService.updateEnvironmentConfig(
      user,
      projectId,
      flagId,
      environmentId,
      dto,
      getAuditContextFromRequest(request)
    );
  }
}
