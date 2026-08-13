import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { getAuditContextFromRequest } from "../audit/audit-context";
import type { AuthenticatedUser } from "../auth/authenticated-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateTargetingRuleDto } from "./dto/create-targeting-rule.dto";
import { ReorderTargetingRulesDto } from "./dto/reorder-targeting-rules.dto";
import { TargetingRuleResponse } from "./dto/targeting-rule-response.dto";
import { UpdateTargetingRuleDto } from "./dto/update-targeting-rule.dto";
import {
  CreateTargetingRuleCommand,
  DeleteTargetingRuleCommand,
  ListTargetingRulesQuery,
  ReorderTargetingRulesCommand,
  UpdateTargetingRuleCommand
} from "./targeting-rules.messages";

@ApiTags("targeting-rules")
@ApiBearerAuth("access-token")
@Controller("projects/:projectId/flags/:flagId/environments/:environmentId/rules")
@UseGuards(JwtAuthGuard)
export class TargetingRulesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @ApiOperation({ summary: "List the targeting rules configured for a feature flag in an environment, in order" })
  @ApiResponse({ status: 200, description: "The ordered list of targeting rules for the environment" })
  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("flagId") flagId: string,
    @Param("environmentId") environmentId: string
  ): Promise<TargetingRuleResponse[]> {
    return this.queryBus.execute(new ListTargetingRulesQuery(user, projectId, flagId, environmentId));
  }

  @ApiOperation({ summary: "Create a new targeting rule on a feature flag's environment configuration" })
  @ApiResponse({ status: 201, description: "The newly created targeting rule" })
  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("flagId") flagId: string,
    @Param("environmentId") environmentId: string,
    @Body() dto: CreateTargetingRuleDto,
    @Req() request: Request
  ): Promise<TargetingRuleResponse> {
    return this.commandBus.execute(
      new CreateTargetingRuleCommand(user, projectId, flagId, environmentId, dto, getAuditContextFromRequest(request))
    );
  }

  @ApiOperation({ summary: "Reorder the targeting rules for a feature flag's environment configuration" })
  @ApiResponse({ status: 200, description: "The targeting rules in their new order" })
  @Post("reorder")
  @HttpCode(200)
  reorder(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("flagId") flagId: string,
    @Param("environmentId") environmentId: string,
    @Body() dto: ReorderTargetingRulesDto,
    @Req() request: Request
  ): Promise<TargetingRuleResponse[]> {
    return this.commandBus.execute(
      new ReorderTargetingRulesCommand(user, projectId, flagId, environmentId, dto, getAuditContextFromRequest(request))
    );
  }

  @ApiOperation({ summary: "Update an existing targeting rule on a feature flag's environment configuration" })
  @ApiResponse({ status: 200, description: "The updated targeting rule" })
  @Patch(":ruleId")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("flagId") flagId: string,
    @Param("environmentId") environmentId: string,
    @Param("ruleId") ruleId: string,
    @Body() dto: UpdateTargetingRuleDto,
    @Req() request: Request
  ): Promise<TargetingRuleResponse> {
    return this.commandBus.execute(
      new UpdateTargetingRuleCommand(
        user,
        projectId,
        flagId,
        environmentId,
        ruleId,
        dto,
        getAuditContextFromRequest(request)
      )
    );
  }

  @ApiOperation({ summary: "Delete a targeting rule from a feature flag's environment configuration" })
  @ApiResponse({ status: 204, description: "The targeting rule was deleted" })
  @Delete(":ruleId")
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("flagId") flagId: string,
    @Param("environmentId") environmentId: string,
    @Param("ruleId") ruleId: string,
    @Req() request: Request
  ): Promise<void> {
    return this.commandBus.execute(
      new DeleteTargetingRuleCommand(user, projectId, flagId, environmentId, ruleId, getAuditContextFromRequest(request))
    );
  }
}
