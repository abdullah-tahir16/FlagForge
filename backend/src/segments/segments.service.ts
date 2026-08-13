import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import type { AuditContext, AuditSnapshot } from "../audit/audit-context";
import { AuditAction } from "../audit/audit-action.enum";
import { AuditResourceType } from "../audit/audit-resource-type.enum";
import { AuditService } from "../audit/audit.service";
import type { AuthenticatedUser } from "../auth/authenticated-user";
import { EvaluationCacheService } from "../common/cache/evaluation-cache.service";
import { createKeyFromName } from "../common/fns/create-key-from-name";
import {
  applyCreatedAtCursorPagination,
  createCursorPaginatedResponse,
  resolveCursorPaginationLimit
} from "../common/pagination/cursor-pagination";
import { ProjectsService } from "../projects/projects.service";
import { RealtimeEventAction } from "../realtime/realtime-event-action.enum";
import type { PublishConfigurationChangedInput } from "../realtime/realtime-event.type";
import { RealtimeResourceType } from "../realtime/realtime-resource-type.enum";
import { RealtimePublisherService } from "../realtime/realtime-publisher.service";
import { TargetingRule } from "../targeting-rules/targeting-rule.entity";
import { validateTargetingComparisonValue } from "../targeting-rules/targeting-rule-matcher";
import type { CreateSegmentConditionDto } from "./dto/create-segment-condition.dto";
import type { CreateSegmentDto } from "./dto/create-segment.dto";
import type { ListSegmentsDto } from "./dto/list-segments.dto";
import type { ReorderSegmentConditionsDto } from "./dto/reorder-segment-conditions.dto";
import type { SegmentConditionResponse, SegmentListResponse, SegmentResponse } from "./dto/segment-response.dto";
import type { UpdateSegmentConditionDto } from "./dto/update-segment-condition.dto";
import type { UpdateSegmentDto } from "./dto/update-segment.dto";
import { SegmentCondition } from "./segment-condition.entity";
import { SegmentMatchMode } from "./segment-match-mode.enum";
import { Segment } from "./segment.entity";

@Injectable()
export class SegmentsService {
  constructor(
    private readonly auditService: AuditService,
    private readonly evaluationCacheService: EvaluationCacheService,
    private readonly realtimePublisher: RealtimePublisherService,
    private readonly dataSource: DataSource,
    private readonly projectsService: ProjectsService,
    @InjectRepository(Segment)
    private readonly segmentsRepository: Repository<Segment>,
    @InjectRepository(SegmentCondition)
    private readonly conditionsRepository: Repository<SegmentCondition>,
    @InjectRepository(TargetingRule)
    private readonly targetingRulesRepository: Repository<TargetingRule>
  ) {}

  async findAll(user: AuthenticatedUser, projectId: string, filters: ListSegmentsDto = {}): Promise<SegmentListResponse> {
    await this.projectsService.findProjectForUser(user, projectId);
    const limit = resolveCursorPaginationLimit(filters.limit);
    const query = this.segmentsRepository.createQueryBuilder("segment").where("segment.project_id = :projectId", { projectId });
    const segments = await applyCreatedAtCursorPagination(query, {
      alias: "segment",
      cursor: filters.cursor,
      limit
    }).getMany();

    return createCursorPaginatedResponse(segments, {
      limit,
      toEntry: (segment) => this.toResponse({ ...segment, conditions: [] })
    });
  }

  async findOptions(user: AuthenticatedUser, projectId: string): Promise<SegmentResponse[]> {
    await this.projectsService.findProjectForUser(user, projectId);
    const segments = await this.segmentsRepository.find({
      order: { name: "ASC" },
      take: 100,
      where: { projectId }
    });

    return segments.map((segment) => this.toResponse({ ...segment, conditions: [] }));
  }

  async findOne(user: AuthenticatedUser, projectId: string, segmentId: string): Promise<SegmentResponse> {
    await this.projectsService.findProjectForUser(user, projectId);
    const segment = await this.findSegmentInProject(projectId, segmentId);

    return this.toResponse(segment);
  }

  async create(
    user: AuthenticatedUser,
    projectId: string,
    dto: CreateSegmentDto,
    auditContext?: AuditContext
  ): Promise<SegmentResponse> {
    await this.projectsService.findProjectForUser(user, projectId);
    const name = dto.name.trim();
    const key = createKeyFromName(name);

    if (!key) {
      throw new ConflictException("Segment key could not be generated");
    }

    const existingSegment = await this.segmentsRepository.findOne({ where: { key, projectId } });

    if (existingSegment) {
      throw new ConflictException("A segment with this key already exists in the project");
    }

    const segment = await this.segmentsRepository.save(
      this.segmentsRepository.create({
        conditions: [],
        description: this.normalizeDescription(dto.description),
        key,
        matchMode: dto.matchMode ?? SegmentMatchMode.MatchAll,
        name,
        projectId
      })
    );

    await this.auditService.record(
      user,
      {
        action: AuditAction.SegmentCreated,
        newValue: this.segmentSnapshot(segment),
        oldValue: null,
        projectId,
        resourceId: segment.id,
        resourceName: segment.name,
        resourceType: AuditResourceType.Segment
      },
      auditContext
    );

    return this.toResponse(segment);
  }

  async update(
    user: AuthenticatedUser,
    projectId: string,
    segmentId: string,
    dto: UpdateSegmentDto,
    auditContext?: AuditContext
  ): Promise<SegmentResponse> {
    await this.projectsService.findProjectForUser(user, projectId);
    const segment = await this.findSegmentInProject(projectId, segmentId);
    const oldValue = this.changedSegmentSnapshot(segment, dto);

    if (dto.name !== undefined) {
      segment.name = dto.name.trim();
    }

    if (dto.description !== undefined) {
      segment.description = this.normalizeDescription(dto.description);
    }

    if (dto.matchMode !== undefined) {
      segment.matchMode = dto.matchMode;
    }

    const savedSegment = await this.segmentsRepository.save(segment);
    await this.auditService.record(
      user,
      {
        action: AuditAction.SegmentUpdated,
        newValue: this.changedSegmentSnapshot(savedSegment, dto),
        oldValue,
        projectId,
        resourceId: savedSegment.id,
        resourceName: savedSegment.name,
        resourceType: AuditResourceType.Segment
      },
      auditContext
    );
    const referencedEnvironmentIds = await this.resolveReferencedEnvironmentIds(segmentId);
    await this.invalidateEnvironmentSnapshots(referencedEnvironmentIds);
    this.publishConfigurationChanged({
      action: RealtimeEventAction.Updated,
      environmentIds: referencedEnvironmentIds,
      organizationId: user.organizationId,
      projectId,
      resourceId: savedSegment.id,
      resourceType: RealtimeResourceType.Segment
    });

    return this.toResponse(savedSegment);
  }

  async remove(user: AuthenticatedUser, projectId: string, segmentId: string, auditContext?: AuditContext): Promise<void> {
    await this.projectsService.findProjectForUser(user, projectId);
    const segment = await this.findSegmentInProject(projectId, segmentId);
    const referencedRule = await this.targetingRulesRepository.findOne({ where: { segmentId } });

    if (referencedRule) {
      throw new ConflictException("Segment is referenced by one or more targeting rules");
    }

    await this.auditService.record(
      user,
      {
        action: AuditAction.SegmentDeleted,
        newValue: null,
        oldValue: this.segmentSnapshot(segment),
        projectId,
        resourceId: segment.id,
        resourceName: segment.name,
        resourceType: AuditResourceType.Segment
      },
      auditContext
    );

    await this.segmentsRepository.remove(segment);
  }

  async createCondition(
    user: AuthenticatedUser,
    projectId: string,
    segmentId: string,
    dto: CreateSegmentConditionDto,
    auditContext?: AuditContext
  ): Promise<SegmentResponse> {
    await this.projectsService.findProjectForUser(user, projectId);
    const segment = await this.findSegmentInProject(projectId, segmentId);
    validateTargetingComparisonValue(dto.operator, dto.comparisonValue);
    const sortOrder = await this.getNextConditionSortOrder(segmentId);
    const condition = await this.conditionsRepository.save(
      this.conditionsRepository.create({
        attribute: dto.attribute.trim(),
        comparisonValue: dto.comparisonValue,
        operator: dto.operator,
        segmentId,
        sortOrder
      })
    );

    await this.auditService.record(
      user,
      {
        action: AuditAction.SegmentConditionCreated,
        newValue: this.conditionSnapshot(condition),
        oldValue: null,
        projectId,
        resourceId: condition.id,
        resourceName: `${segment.name} condition ${condition.sortOrder}`,
        resourceType: AuditResourceType.SegmentCondition
      },
      auditContext
    );
    const referencedEnvironmentIds = await this.resolveReferencedEnvironmentIds(segmentId);
    await this.invalidateEnvironmentSnapshots(referencedEnvironmentIds);
    this.publishConfigurationChanged({
      action: RealtimeEventAction.Created,
      environmentIds: referencedEnvironmentIds,
      organizationId: user.organizationId,
      projectId,
      resourceId: condition.id,
      resourceType: RealtimeResourceType.SegmentCondition
    });

    return this.findOne(user, projectId, segmentId);
  }

  async updateCondition(
    user: AuthenticatedUser,
    projectId: string,
    segmentId: string,
    conditionId: string,
    dto: UpdateSegmentConditionDto,
    auditContext?: AuditContext
  ): Promise<SegmentResponse> {
    await this.projectsService.findProjectForUser(user, projectId);
    const segment = await this.findSegmentInProject(projectId, segmentId);
    const condition = this.findConditionInSegment(segment, conditionId);
    const nextOperator = dto.operator ?? condition.operator;
    const nextComparisonValue = dto.comparisonValue ?? condition.comparisonValue;
    validateTargetingComparisonValue(nextOperator, nextComparisonValue);
    const oldValue = this.changedConditionSnapshot(condition, dto);

    if (dto.attribute !== undefined) {
      condition.attribute = dto.attribute.trim();
    }

    if (dto.operator !== undefined) {
      condition.operator = dto.operator;
    }

    if (dto.comparisonValue !== undefined) {
      condition.comparisonValue = dto.comparisonValue;
    }

    const savedCondition = await this.conditionsRepository.save(condition);
    await this.auditService.record(
      user,
      {
        action: AuditAction.SegmentConditionUpdated,
        newValue: this.changedConditionSnapshot(savedCondition, dto),
        oldValue,
        projectId,
        resourceId: savedCondition.id,
        resourceName: `${segment.name} condition ${savedCondition.sortOrder}`,
        resourceType: AuditResourceType.SegmentCondition
      },
      auditContext
    );
    const referencedEnvironmentIds = await this.resolveReferencedEnvironmentIds(segmentId);
    await this.invalidateEnvironmentSnapshots(referencedEnvironmentIds);
    this.publishConfigurationChanged({
      action: RealtimeEventAction.Updated,
      environmentIds: referencedEnvironmentIds,
      organizationId: user.organizationId,
      projectId,
      resourceId: savedCondition.id,
      resourceType: RealtimeResourceType.SegmentCondition
    });

    return this.findOne(user, projectId, segmentId);
  }

  async removeCondition(
    user: AuthenticatedUser,
    projectId: string,
    segmentId: string,
    conditionId: string,
    auditContext?: AuditContext
  ): Promise<SegmentResponse> {
    await this.projectsService.findProjectForUser(user, projectId);
    const segment = await this.findSegmentInProject(projectId, segmentId);
    const condition = this.findConditionInSegment(segment, conditionId);
    const oldValue = this.conditionSnapshot(condition);
    const resourceId = condition.id;
    const resourceName = `${segment.name} condition ${condition.sortOrder}`;

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(SegmentCondition).remove(condition);
      await this.resequenceConditions(segmentId, manager.getRepository(SegmentCondition));
    });

    await this.auditService.record(
      user,
      {
        action: AuditAction.SegmentConditionDeleted,
        newValue: null,
        oldValue,
        projectId,
        resourceId,
        resourceName,
        resourceType: AuditResourceType.SegmentCondition
      },
      auditContext
    );
    const referencedEnvironmentIds = await this.resolveReferencedEnvironmentIds(segmentId);
    await this.invalidateEnvironmentSnapshots(referencedEnvironmentIds);
    this.publishConfigurationChanged({
      action: RealtimeEventAction.Deleted,
      environmentIds: referencedEnvironmentIds,
      organizationId: user.organizationId,
      projectId,
      resourceId,
      resourceType: RealtimeResourceType.SegmentCondition
    });

    return this.findOne(user, projectId, segmentId);
  }

  async reorderConditions(
    user: AuthenticatedUser,
    projectId: string,
    segmentId: string,
    dto: ReorderSegmentConditionsDto,
    auditContext?: AuditContext
  ): Promise<SegmentResponse> {
    await this.projectsService.findProjectForUser(user, projectId);
    const segment = await this.findSegmentInProject(projectId, segmentId);
    const beforeIds = this.getOrderedConditions(segment).map((condition) => condition.id);
    this.assertCompleteReorder(beforeIds, dto.conditionIds);

    await this.dataSource.transaction(async (manager) => {
      const conditionsRepository = manager.getRepository(SegmentCondition);

      for (const [index, conditionId] of dto.conditionIds.entries()) {
        await conditionsRepository.update({ id: conditionId, segmentId }, { sortOrder: index + 1 });
      }
    });

    await this.auditService.record(
      user,
      {
        action: AuditAction.SegmentConditionReordered,
        newValue: { conditionIds: dto.conditionIds },
        oldValue: { conditionIds: beforeIds },
        projectId,
        resourceId: segment.id,
        resourceName: `${segment.name} conditions`,
        resourceType: AuditResourceType.SegmentCondition
      },
      auditContext
    );
    const referencedEnvironmentIds = await this.resolveReferencedEnvironmentIds(segmentId);
    await this.invalidateEnvironmentSnapshots(referencedEnvironmentIds);
    this.publishConfigurationChanged({
      action: RealtimeEventAction.Reordered,
      environmentIds: referencedEnvironmentIds,
      organizationId: user.organizationId,
      projectId,
      resourceId: segment.id,
      resourceType: RealtimeResourceType.SegmentCondition
    });

    return this.findOne(user, projectId, segmentId);
  }

  private async resolveReferencedEnvironmentIds(segmentId: string): Promise<string[]> {
    const rows = await this.targetingRulesRepository
      .createQueryBuilder("targetingRule")
      .innerJoin("targetingRule.environmentFlagConfig", "environmentConfig")
      .select("DISTINCT environmentConfig.environment_id", "environmentId")
      .where("targetingRule.segment_id = :segmentId", { segmentId })
      .getRawMany<{ environmentId: string }>();

    return rows.map((row) => row.environmentId);
  }

  private publishConfigurationChanged(input: PublishConfigurationChangedInput): void {
    try {
      this.realtimePublisher.publishConfigurationChanged(input);
    } catch {
      // Realtime notifications are best-effort and must not fail successful management writes.
    }
  }

  private async invalidateEnvironmentSnapshots(environmentIds: string[]): Promise<void> {
    if (environmentIds.length > 0) {
      await this.evaluationCacheService.deleteEnvironmentSnapshots(environmentIds);
    }
  }

  private async findSegmentInProject(projectId: string, segmentId: string): Promise<Segment> {
    const segment = await this.segmentsRepository.findOne({
      relations: { conditions: true },
      where: { id: segmentId, projectId }
    });

    if (!segment) {
      throw new NotFoundException("Segment was not found");
    }

    segment.conditions = this.getOrderedConditions(segment);

    return segment;
  }

  private findConditionInSegment(segment: Segment, conditionId: string): SegmentCondition {
    const condition = segment.conditions.find((candidate) => candidate.id === conditionId);

    if (!condition) {
      throw new NotFoundException("Segment condition was not found");
    }

    return condition;
  }

  private getOrderedConditions(segment: Pick<Segment, "conditions">): SegmentCondition[] {
    return [...(segment.conditions ?? [])].sort((first, second) => first.sortOrder - second.sortOrder);
  }

  private async getNextConditionSortOrder(segmentId: string): Promise<number> {
    const result = await this.conditionsRepository
      .createQueryBuilder("condition")
      .select("COALESCE(MAX(condition.sort_order), 0)", "max")
      .where("condition.segment_id = :segmentId", { segmentId })
      .getRawOne<{ max: number | string }>();

    return Number(result?.max ?? 0) + 1;
  }

  private async resequenceConditions(segmentId: string, conditionsRepository: Repository<SegmentCondition>): Promise<void> {
    const conditions = await conditionsRepository.find({ order: { sortOrder: "ASC" }, where: { segmentId } });

    for (const [index, condition] of conditions.entries()) {
      if (condition.sortOrder !== index + 1) {
        condition.sortOrder = index + 1;
        await conditionsRepository.save(condition);
      }
    }
  }

  private assertCompleteReorder(existingIds: string[], requestedIds: string[]): void {
    const existingSet = new Set(existingIds);
    const requestedSet = new Set(requestedIds);

    if (existingIds.length !== requestedIds.length || existingSet.size !== requestedSet.size) {
      throw new BadRequestException("Reorder payload must include every segment condition exactly once");
    }

    const allIdsMatch = existingIds.every((id) => requestedSet.has(id)) && requestedIds.every((id) => existingSet.has(id));

    if (!allIdsMatch) {
      throw new BadRequestException("Reorder payload contains unknown segment conditions");
    }
  }

  private normalizeDescription(description: string | null | undefined): string | null {
    if (description === null || description === undefined) {
      return null;
    }

    const trimmedDescription = description.trim();

    return trimmedDescription ? trimmedDescription : null;
  }

  private changedSegmentSnapshot(segment: Segment, dto: UpdateSegmentDto): AuditSnapshot {
    const snapshot: AuditSnapshot = {};

    if (dto.name !== undefined) {
      snapshot.name = segment.name;
    }

    if (dto.description !== undefined) {
      snapshot.description = segment.description;
    }

    if (dto.matchMode !== undefined) {
      snapshot.matchMode = segment.matchMode;
    }

    return snapshot;
  }

  private changedConditionSnapshot(condition: SegmentCondition, dto: UpdateSegmentConditionDto): AuditSnapshot {
    const snapshot: AuditSnapshot = {};

    if (dto.attribute !== undefined) {
      snapshot.attribute = condition.attribute;
    }

    if (dto.operator !== undefined) {
      snapshot.operator = condition.operator;
    }

    if (dto.comparisonValue !== undefined) {
      snapshot.comparisonValue = condition.comparisonValue;
    }

    return snapshot;
  }

  private segmentSnapshot(segment: Segment): AuditSnapshot {
    return {
      description: segment.description,
      key: segment.key,
      matchMode: segment.matchMode,
      name: segment.name,
      projectId: segment.projectId
    };
  }

  private conditionSnapshot(condition: SegmentCondition): AuditSnapshot {
    return {
      attribute: condition.attribute,
      comparisonValue: condition.comparisonValue,
      operator: condition.operator,
      segmentId: condition.segmentId,
      sortOrder: condition.sortOrder
    };
  }

  private toConditionResponse(condition: SegmentCondition): SegmentConditionResponse {
    return {
      attribute: condition.attribute,
      comparisonValue: condition.comparisonValue,
      createdAt: condition.createdAt,
      id: condition.id,
      operator: condition.operator,
      segmentId: condition.segmentId,
      sortOrder: condition.sortOrder,
      updatedAt: condition.updatedAt
    };
  }

  private toResponse(segment: Segment): SegmentResponse {
    return {
      conditions: this.getOrderedConditions(segment).map((condition) => this.toConditionResponse(condition)),
      createdAt: segment.createdAt,
      description: segment.description,
      id: segment.id,
      key: segment.key,
      matchMode: segment.matchMode,
      name: segment.name,
      projectId: segment.projectId,
      updatedAt: segment.updatedAt
    };
  }
}
