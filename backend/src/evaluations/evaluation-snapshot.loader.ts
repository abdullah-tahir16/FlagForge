import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EvaluationCacheService } from "../common/cache/evaluation-cache.service";
import {
  CachedEnvironmentEvaluationSnapshot,
  CachedEvaluationFlag,
  CachedEvaluationSegment,
  CachedEvaluationTargetingRule
} from "../common/cache/evaluation-cache-snapshot";
import { EVALUATION_CACHE_SCHEMA_VERSION } from "../common/cache/evaluation-cache-keys";
import { FeatureFlag } from "../feature-flags/feature-flag.entity";
import { Segment } from "../segments/segment.entity";
import { TargetingRule } from "../targeting-rules/targeting-rule.entity";
import { SdkEvaluationContext } from "./sdk-evaluation-context";

@Injectable()
export class EvaluationSnapshotLoader {
  constructor(
    private readonly evaluationCacheService: EvaluationCacheService,
    @InjectRepository(FeatureFlag)
    private readonly featureFlagsRepository: Repository<FeatureFlag>
  ) {}

  async getEnvironmentSnapshot(context: SdkEvaluationContext): Promise<CachedEnvironmentEvaluationSnapshot> {
    const cachedSnapshot = await this.evaluationCacheService
      .readEnvironmentSnapshot(context.environment.id)
      .catch(() => null);

    if (cachedSnapshot && cachedSnapshot.projectId === context.environment.projectId) {
      return cachedSnapshot;
    }

    const snapshot = await this.loadEnvironmentSnapshotFromDatabase(context);
    await this.evaluationCacheService.writeEnvironmentSnapshot(snapshot).catch(() => undefined);

    return snapshot;
  }

  async loadEnvironmentSnapshotFromDatabase(context: SdkEvaluationContext): Promise<CachedEnvironmentEvaluationSnapshot> {
    const featureFlags = await this.featureFlagsRepository
      .createQueryBuilder("featureFlag")
      .leftJoinAndSelect(
        "featureFlag.environmentConfigs",
        "environmentConfig",
        "environmentConfig.environment_id = :environmentId",
        { environmentId: context.environment.id }
      )
      .leftJoinAndSelect("environmentConfig.targetingRules", "targetingRule")
      .leftJoinAndSelect("targetingRule.segment", "segment")
      .leftJoinAndSelect("segment.conditions", "segmentCondition")
      .where("featureFlag.project_id = :projectId", { projectId: context.environment.projectId })
      .orderBy("featureFlag.key", "ASC")
      .addOrderBy("targetingRule.sort_order", "ASC")
      .addOrderBy("segmentCondition.sort_order", "ASC")
      .getMany();

    return {
      environment: {
        id: context.environment.id,
        key: context.environment.key,
        name: context.environment.name,
        projectId: context.environment.projectId
      },
      flags: featureFlags.map((featureFlag) => this.toCachedFlag(featureFlag)),
      projectId: context.environment.projectId,
      schemaVersion: EVALUATION_CACHE_SCHEMA_VERSION
    };
  }

  private toCachedFlag(featureFlag: FeatureFlag): CachedEvaluationFlag {
    const config = featureFlag.environmentConfigs?.[0] ?? null;

    return {
      config: config
        ? {
            enabled: config.enabled,
            environmentId: config.environmentId,
            featureFlagId: config.featureFlagId,
            id: config.id,
            rolloutPercentage: config.rolloutPercentage,
            value: config.value
          }
        : null,
      id: featureFlag.id,
      key: featureFlag.key,
      name: featureFlag.name,
      targetingRules: [...(config?.targetingRules ?? [])]
        .sort((first, second) => first.sortOrder - second.sortOrder)
        .map((rule) => this.toCachedTargetingRule(rule)),
      type: featureFlag.type
    };
  }

  private toCachedTargetingRule(rule: TargetingRule): CachedEvaluationTargetingRule {
    return {
      attribute: rule.attribute,
      comparisonValue: rule.comparisonValue,
      id: rule.id,
      operator: rule.operator,
      resultValue: rule.resultValue,
      segment: rule.segment ? this.toCachedSegment(rule.segment) : null,
      segmentId: rule.segmentId,
      sortOrder: rule.sortOrder,
      source: rule.source
    };
  }

  private toCachedSegment(segment: Segment): CachedEvaluationSegment {
    return {
      conditions: [...(segment.conditions ?? [])]
        .sort((first, second) => first.sortOrder - second.sortOrder)
        .map((condition) => ({
          attribute: condition.attribute,
          comparisonValue: condition.comparisonValue,
          id: condition.id,
          operator: condition.operator,
          sortOrder: condition.sortOrder
        })),
      id: segment.id,
      key: segment.key,
      matchMode: segment.matchMode,
      name: segment.name
    };
  }
}
