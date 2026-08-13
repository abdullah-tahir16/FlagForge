import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
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

@ApiTags("segments")
@ApiBearerAuth("access-token")
@Controller("projects/:projectId/segments")
@UseGuards(JwtAuthGuard)
export class SegmentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @ApiOperation({ summary: "List segments for a project, optionally filtered" })
  @ApiResponse({ status: 200, description: "Paginated list of segments matching the filters" })
  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Query() filters: ListSegmentsDto
  ): Promise<SegmentListResponse> {
    return this.queryBus.execute(new ListSegmentsQuery(user, projectId, filters));
  }

  @ApiOperation({ summary: "List up to 100 segments for a project (without conditions) for use in selection dropdowns" })
  @ApiResponse({ status: 200, description: "Lightweight list of segments ordered by name" })
  @Get("options")
  findOptions(@CurrentUser() user: AuthenticatedUser, @Param("projectId") projectId: string): Promise<SegmentResponse[]> {
    return this.queryBus.execute(new ListSegmentOptionsQuery(user, projectId));
  }

  @ApiOperation({ summary: "Create a new segment in the project" })
  @ApiResponse({ status: 201, description: "The created segment" })
  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Body() dto: CreateSegmentDto,
    @Req() request: Request
  ): Promise<SegmentResponse> {
    return this.commandBus.execute(new CreateSegmentCommand(user, projectId, dto, getAuditContextFromRequest(request)));
  }

  @ApiOperation({ summary: "Get a single segment by id, including its conditions" })
  @ApiResponse({ status: 200, description: "The requested segment" })
  @Get(":segmentId")
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("segmentId") segmentId: string
  ): Promise<SegmentResponse> {
    return this.queryBus.execute(new GetSegmentQuery(user, projectId, segmentId));
  }

  @ApiOperation({ summary: "Update a segment's name or metadata" })
  @ApiResponse({ status: 200, description: "The updated segment" })
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

  @ApiOperation({ summary: "Delete a segment" })
  @ApiResponse({ status: 204, description: "The segment was deleted" })
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

  @ApiOperation({ summary: "Add a new targeting condition to a segment" })
  @ApiResponse({ status: 201, description: "The segment with the new condition added" })
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

  @ApiOperation({ summary: "Reorder a segment's conditions" })
  @ApiResponse({ status: 200, description: "The segment with conditions in the new order" })
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

  @ApiOperation({ summary: "Update a segment condition" })
  @ApiResponse({ status: 200, description: "The segment with the updated condition" })
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

  @ApiOperation({ summary: "Remove a condition from a segment" })
  @ApiResponse({ status: 200, description: "The segment with the condition removed" })
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
