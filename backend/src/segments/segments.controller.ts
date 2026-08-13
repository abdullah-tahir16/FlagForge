import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import type { Request } from "express";
import { getAuditContextFromRequest } from "../audit/audit-context";
import type { AuthenticatedUser } from "../auth/authenticated-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateSegmentConditionDto } from "./dto/create-segment-condition.dto";
import { CreateSegmentDto } from "./dto/create-segment.dto";
import { ListSegmentsDto } from "./dto/list-segments.dto";
import { ReorderSegmentConditionsDto } from "./dto/reorder-segment-conditions.dto";
import type { SegmentListResponse, SegmentResponse } from "./dto/segment-response.dto";
import { UpdateSegmentConditionDto } from "./dto/update-segment-condition.dto";
import { UpdateSegmentDto } from "./dto/update-segment.dto";
import {
  CreateSegmentCommand,
  CreateSegmentConditionCommand,
  DeleteSegmentCommand,
  DeleteSegmentConditionCommand,
  GetSegmentQuery,
  ListSegmentOptionsQuery,
  ListSegmentsQuery,
  ReorderSegmentConditionsCommand,
  UpdateSegmentCommand,
  UpdateSegmentConditionCommand
} from "./segments.messages";

@Controller("projects/:projectId/segments")
@UseGuards(JwtAuthGuard)
export class SegmentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Query() filters: ListSegmentsDto
  ): Promise<SegmentListResponse> {
    return this.queryBus.execute(new ListSegmentsQuery(user, projectId, filters));
  }

  @Get("options")
  findOptions(@CurrentUser() user: AuthenticatedUser, @Param("projectId") projectId: string): Promise<SegmentResponse[]> {
    return this.queryBus.execute(new ListSegmentOptionsQuery(user, projectId));
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Body() dto: CreateSegmentDto,
    @Req() request: Request
  ): Promise<SegmentResponse> {
    return this.commandBus.execute(new CreateSegmentCommand(user, projectId, dto, getAuditContextFromRequest(request)));
  }

  @Get(":segmentId")
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("segmentId") segmentId: string
  ): Promise<SegmentResponse> {
    return this.queryBus.execute(new GetSegmentQuery(user, projectId, segmentId));
  }

  @Patch(":segmentId")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("segmentId") segmentId: string,
    @Body() dto: UpdateSegmentDto,
    @Req() request: Request
  ): Promise<SegmentResponse> {
    return this.commandBus.execute(
      new UpdateSegmentCommand(user, projectId, segmentId, dto, getAuditContextFromRequest(request))
    );
  }

  @Delete(":segmentId")
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("segmentId") segmentId: string,
    @Req() request: Request
  ): Promise<void> {
    return this.commandBus.execute(new DeleteSegmentCommand(user, projectId, segmentId, getAuditContextFromRequest(request)));
  }

  @Post(":segmentId/conditions")
  createCondition(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("segmentId") segmentId: string,
    @Body() dto: CreateSegmentConditionDto,
    @Req() request: Request
  ): Promise<SegmentResponse> {
    return this.commandBus.execute(
      new CreateSegmentConditionCommand(user, projectId, segmentId, dto, getAuditContextFromRequest(request))
    );
  }

  @Post(":segmentId/conditions/reorder")
  @HttpCode(200)
  reorderConditions(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("segmentId") segmentId: string,
    @Body() dto: ReorderSegmentConditionsDto,
    @Req() request: Request
  ): Promise<SegmentResponse> {
    return this.commandBus.execute(
      new ReorderSegmentConditionsCommand(user, projectId, segmentId, dto, getAuditContextFromRequest(request))
    );
  }

  @Patch(":segmentId/conditions/:conditionId")
  updateCondition(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("segmentId") segmentId: string,
    @Param("conditionId") conditionId: string,
    @Body() dto: UpdateSegmentConditionDto,
    @Req() request: Request
  ): Promise<SegmentResponse> {
    return this.commandBus.execute(
      new UpdateSegmentConditionCommand(user, projectId, segmentId, conditionId, dto, getAuditContextFromRequest(request))
    );
  }

  @Delete(":segmentId/conditions/:conditionId")
  removeCondition(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("segmentId") segmentId: string,
    @Param("conditionId") conditionId: string,
    @Req() request: Request
  ): Promise<SegmentResponse> {
    return this.commandBus.execute(
      new DeleteSegmentConditionCommand(user, projectId, segmentId, conditionId, getAuditContextFromRequest(request))
    );
  }
}
