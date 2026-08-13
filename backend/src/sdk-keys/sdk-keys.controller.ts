import { Body, Controller, Delete, Get, HttpCode, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { getAuditContextFromRequest } from "../audit/audit-context";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateSdkKeyDto } from "./dto/create-sdk-key.dto";
import { CreatedSdkKeyResponse, SdkKeyResponse } from "./dto/sdk-key-response.dto";
import { SdkKeysService } from "./sdk-keys.service";

@ApiTags("sdk-keys")
@ApiBearerAuth("access-token")
@Controller("projects/:projectId/environments/:environmentId/sdk-keys")
@UseGuards(JwtAuthGuard)
export class SdkKeysController {
  constructor(private readonly sdkKeysService: SdkKeysService) {}

  @Post()
  @ApiOperation({
    summary: "Create a new SDK key for an environment. The full secret is returned only once, in this response."
  })
  @ApiResponse({ status: 201, description: "The created SDK key, including the full secret (shown only once)." })
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
  @ApiOperation({ summary: "List SDK keys for an environment, ordered by creation date descending." })
  @ApiResponse({ status: 200, description: "The list of SDK keys (without their secrets)." })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("environmentId") environmentId: string
  ): Promise<SdkKeyResponse[]> {
    return this.sdkKeysService.findAll(user, projectId, environmentId);
  }

  @Delete(":sdkKeyId")
  @HttpCode(204)
  @ApiOperation({ summary: "Revoke an SDK key, marking it as revoked if it is not already." })
  @ApiResponse({ status: 204, description: "The SDK key was revoked. No content is returned." })
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
