import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
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

@Controller("projects/:projectId/flags")
@UseGuards(JwtAuthGuard)
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Body() dto: CreateFeatureFlagDto,
    @Req() request: Request
  ): Promise<FeatureFlagResponse> {
    return this.featureFlagsService.create(user, projectId, dto, getAuditContextFromRequest(request));
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Param("projectId") projectId: string): Promise<FeatureFlagResponse[]> {
    return this.featureFlagsService.findAll(user, projectId);
  }

  @Get(":flagId")
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("flagId") flagId: string
  ): Promise<FeatureFlagResponse> {
    return this.featureFlagsService.findOne(user, projectId, flagId);
  }

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
