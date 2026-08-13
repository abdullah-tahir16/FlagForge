import { Body, Controller, Delete, Get, HttpCode, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { getAuditContextFromRequest } from "../audit/audit-context";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateSdkKeyDto } from "./dto/create-sdk-key.dto";
import { CreatedSdkKeyResponse, SdkKeyResponse } from "./dto/sdk-key-response.dto";
import { SdkKeysService } from "./sdk-keys.service";

@Controller("projects/:projectId/environments/:environmentId/sdk-keys")
@UseGuards(JwtAuthGuard)
export class SdkKeysController {
  constructor(private readonly sdkKeysService: SdkKeysService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("environmentId") environmentId: string,
    @Body() dto: CreateSdkKeyDto,
    @Req() request: Request
  ): Promise<CreatedSdkKeyResponse> {
    return this.sdkKeysService.create(user, projectId, environmentId, dto, getAuditContextFromRequest(request));
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("environmentId") environmentId: string
  ): Promise<SdkKeyResponse[]> {
    return this.sdkKeysService.findAll(user, projectId, environmentId);
  }

  @Delete(":sdkKeyId")
  @HttpCode(204)
  revoke(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("environmentId") environmentId: string,
    @Param("sdkKeyId") sdkKeyId: string,
    @Req() request: Request
  ): Promise<void> {
    return this.sdkKeysService.revoke(user, projectId, environmentId, sdkKeyId, getAuditContextFromRequest(request));
  }
}
