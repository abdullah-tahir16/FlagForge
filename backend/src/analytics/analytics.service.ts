import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import type { AuthenticatedUser } from "../auth/authenticated-user";
import type { EvaluationReason } from "../evaluations/dto/evaluation-response.dto";
import { ProjectsService } from "../projects/projects.service";
import type { AnalyticsOverviewResponse } from "./dto/analytics-overview-response.dto";
import type { AnalyticsRange, ListAnalyticsOverviewDto } from "./dto/list-analytics-overview.dto";
import { EvaluationEventType } from "./evaluation-event-type.enum";
import { EvaluationEvent } from "./evaluation-event.entity";

export interface RecordEvaluationEventInput {
  environmentId: string;
  evaluationType: EvaluationEventType;
  flagKey: string;
  organizationId: string;
  projectId: string;
  reason: EvaluationReason;
  sdkKeyId: string;
  value: boolean;
}

const analyticsRangeHours: Record<AnalyticsRange, number> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30
};

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly projectsService: ProjectsService,
    @InjectRepository(EvaluationEvent)
    private readonly evaluationEventsRepository: Repository<EvaluationEvent>
  ) {}

  async recordEvaluations(inputs: RecordEvaluationEventInput[]): Promise<void> {
    if (inputs.length === 0) {
      return;
    }

    const occurredAt = new Date();
    const events = inputs.map((input) =>
      this.evaluationEventsRepository.create({
        environmentId: input.environmentId,
        evaluationType: input.evaluationType,
        flagKey: input.flagKey,
        occurredAt,
        organizationId: input.organizationId,
        projectId: input.projectId,
        reason: input.reason,
        sdkKeyId: input.sdkKeyId,
        value: input.value
      })
    );

    await this.evaluationEventsRepository.insert(events);
  }

  async getProjectOverview(
    user: AuthenticatedUser,
    projectId: string,
    filters: ListAnalyticsOverviewDto = {}
  ): Promise<AnalyticsOverviewResponse> {
    await this.projectsService.findProjectForUser(user, projectId);
    const range = filters.range ?? "7d";
    const since = new Date(Date.now() - analyticsRangeHours[range] * 60 * 60 * 1000);
    const baseQuery = this.applyOverviewFilters(
      this.evaluationEventsRepository
        .createQueryBuilder("event")
        .where("event.project_id = :projectId", { projectId })
        .andWhere("event.occurred_at >= :since", { since }),
      filters
    );

    const totals = await baseQuery
      .clone()
      .select("COUNT(*)", "total")
      .addSelect("COALESCE(SUM(CASE WHEN event.value = TRUE THEN 1 ELSE 0 END), 0)", "trueCount")
      .addSelect("COALESCE(SUM(CASE WHEN event.value = FALSE THEN 1 ELSE 0 END), 0)", "falseCount")
      .getRawOne<{ falseCount: string; total: string; trueCount: string }>();
    const reasonRows = await baseQuery
      .clone()
      .select("event.reason", "reason")
      .addSelect("COUNT(*)", "count")
      .groupBy("event.reason")
      .orderBy("count", "DESC")
      .getRawMany<{ count: string; reason: EvaluationReason }>();
    const topFlagRows = await baseQuery
      .clone()
      .select("event.flag_key", "flagKey")
      .addSelect("COUNT(*)", "total")
      .addSelect("COALESCE(SUM(CASE WHEN event.value = TRUE THEN 1 ELSE 0 END), 0)", "trueCount")
      .addSelect("COALESCE(SUM(CASE WHEN event.value = FALSE THEN 1 ELSE 0 END), 0)", "falseCount")
      .groupBy("event.flag_key")
      .orderBy("total", "DESC")
      .addOrderBy("event.flag_key", "ASC")
      .limit(5)
      .getRawMany<{ falseCount: string; flagKey: string; total: string; trueCount: string }>();
    const bucketExpression = this.getBucketExpression(range);
    const bucketRows = await baseQuery
      .clone()
      .select(bucketExpression, "bucketStart")
      .addSelect("COUNT(*)", "total")
      .addSelect("COALESCE(SUM(CASE WHEN event.value = TRUE THEN 1 ELSE 0 END), 0)", "trueCount")
      .addSelect("COALESCE(SUM(CASE WHEN event.value = FALSE THEN 1 ELSE 0 END), 0)", "falseCount")
      .groupBy(bucketExpression)
      .orderBy(bucketExpression, "ASC")
      .getRawMany<{ bucketStart: Date; falseCount: string; total: string; trueCount: string }>();

    return {
      falseCount: Number(totals?.falseCount ?? 0),
      filters: {
        environmentId: filters.environmentId ?? null,
        flagKey: filters.flagKey ?? null,
        range
      },
      reasonBreakdown: reasonRows.map((row) => ({ count: Number(row.count), reason: row.reason })),
      timeBuckets: bucketRows.map((row) => ({
        bucketStart: new Date(row.bucketStart),
        falseCount: Number(row.falseCount),
        total: Number(row.total),
        trueCount: Number(row.trueCount)
      })),
      topFlags: topFlagRows.map((row) => ({
        falseCount: Number(row.falseCount),
        flagKey: row.flagKey,
        total: Number(row.total),
        trueCount: Number(row.trueCount)
      })),
      totalEvaluations: Number(totals?.total ?? 0),
      trueCount: Number(totals?.trueCount ?? 0)
    };
  }

  private applyOverviewFilters(
    query: SelectQueryBuilder<EvaluationEvent>,
    filters: ListAnalyticsOverviewDto
  ): SelectQueryBuilder<EvaluationEvent> {
    if (filters.environmentId) {
      query.andWhere("event.environment_id = :environmentId", { environmentId: filters.environmentId });
    }

    if (filters.flagKey) {
      query.andWhere("event.flag_key = :flagKey", { flagKey: filters.flagKey });
    }

    return query;
  }

  private getBucketExpression(range: AnalyticsRange): string {
    if (range === "24h") {
      return `date_trunc('hour', event.occurred_at)`;
    }

    return `date_trunc('day', event.occurred_at)`;
  }
}
