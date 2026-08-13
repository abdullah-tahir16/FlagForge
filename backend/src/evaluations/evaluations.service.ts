import { Injectable } from "@nestjs/common";
import { AnalyticsService } from "../analytics/analytics.service";
import { EvaluationEventType } from "../analytics/evaluation-event-type.enum";
import {
  CachedEvaluationFlag,
  CachedEvaluationFlagConfig,
  CachedEvaluationSegment,
  CachedEvaluationTargetingRule
} from "../common/cache/evaluation-cache-snapshot";
import { matchesSegment } from "../segments/segment-matcher";
import { TargetingRuleSource } from "../targeting-rules/targeting-rule-source.enum";
import { findMatchingTargetingRule } from "../targeting-rules/targeting-rule-matcher";
import type { TargetingComparisonValue } from "../targeting-rules/targeting-rule-comparison-value";
import type { TargetingRuleOperator } from "../targeting-rules/targeting-rule-operator.enum";
import { SdkEvaluationRequest } from "./dto/evaluation-request.dto";
import {
  AllEvaluationsResponse,
  EvaluationEnvironmentResponse,
  EvaluationSegmentResponse,
  EvaluationTargetingRuleResponse,
  EvaluationReason,
  SingleEvaluationResponse
} from "./dto/evaluation-response.dto";
import { EvaluationSnapshotLoader } from "./evaluation-snapshot.loader";
import { getPercentageRolloutBucket } from "./percentage-rollout";
import { SdkEvaluationContext } from "./sdk-evaluation-context";

type DirectAttributeRule = CachedEvaluationTargetingRule & {
  attribute: string;
  comparisonValue: TargetingComparisonValue;
  operator: TargetingRuleOperator;
  source: TargetingRuleSource.Attribute;
};

@Injectable()
export class EvaluationsService {
  constructor(
    private readonly evaluationSnapshotLoader: EvaluationSnapshotLoader,
    private readonly analyticsService: AnalyticsService
  ) {}

  async evaluateOne(
    context: SdkEvaluationContext,
    flagKey: string,
    evaluationContext: SdkEvaluationRequest = {}
  ): Promise<SingleEvaluationResponse> {
    const snapshot = await this.evaluationSnapshotLoader.getEnvironmentSnapshot(context);
    const featureFlag = snapshot.flags.find((flag) => flag.key === flagKey);

    if (!featureFlag) {
      const response = this.toSingleResponse(context, flagKey, false, "FLAG_NOT_FOUND");
      await this.recordEvaluation(context, flagKey, response.value, response.reason, EvaluationEventType.Single);

      return response;
    }

    if (!featureFlag.config) {
      const response = this.toSingleResponse(context, featureFlag.key, false, "CONFIG_NOT_FOUND");
      await this.recordEvaluation(context, featureFlag.key, response.value, response.reason, EvaluationEventType.Single);

      return response;
    }

    const evaluated = this.evaluateFlag(context, { ...featureFlag, config: featureFlag.config }, evaluationContext);

    const response = this.toSingleResponse(
      context,
      featureFlag.key,
      evaluated.value,
      evaluated.reason,
      evaluated.targetingRule,
      evaluated.segment
    );
    await this.recordEvaluation(context, featureFlag.key, response.value, response.reason, EvaluationEventType.Single);

    return response;
  }

  async evaluateAll(
    context: SdkEvaluationContext,
    evaluationContext: SdkEvaluationRequest = {}
  ): Promise<AllEvaluationsResponse> {
    const snapshot = await this.evaluationSnapshotLoader.getEnvironmentSnapshot(context);
    const flags: Record<string, boolean> = {};
    const reasons: AllEvaluationsResponse["reasons"] = {};

    snapshot.flags.forEach((featureFlag) => {
      const evaluated = featureFlag.config
        ? this.evaluateFlag(context, { ...featureFlag, config: featureFlag.config }, evaluationContext)
        : { reason: "CONFIG_NOT_FOUND" as const, value: false };

      flags[featureFlag.key] = evaluated.value;
      reasons[featureFlag.key] = evaluated;
    });

    const response = {
      environment: this.toEnvironmentResponse(context),
      evaluatedAt: new Date(),
      flags,
      reasons
    };
    await this.recordEvaluations(
      context,
      Object.entries(response.reasons).map(([flagKey, reason]) => ({
        flagKey,
        reason: reason.reason,
        value: reason.value
      })),
      EvaluationEventType.All
    );

    return response;
  }

  private async recordEvaluation(
    context: SdkEvaluationContext,
    flagKey: string,
    value: boolean,
    reason: EvaluationReason,
    evaluationType: EvaluationEventType
  ): Promise<void> {
    await this.recordEvaluations(context, [{ flagKey, reason, value }], evaluationType);
  }

  private async recordEvaluations(
    context: SdkEvaluationContext,
    values: { flagKey: string; reason: EvaluationReason; value: boolean }[],
    evaluationType: EvaluationEventType
  ): Promise<void> {
    try {
      await this.analyticsService.recordEvaluations(
        values.map((value) => ({
          environmentId: context.environment.id,
          evaluationType,
          flagKey: value.flagKey,
          organizationId: context.environment.project.organizationId,
          projectId: context.environment.projectId,
          reason: value.reason,
          sdkKeyId: context.sdkKey.id,
          value: value.value
        }))
      );
    } catch {
      // Analytics is best-effort and must not affect SDK evaluation responses.
    }
  }

  private evaluateFlag(
    context: SdkEvaluationContext,
    flag: CachedEvaluationFlag & { config: CachedEvaluationFlagConfig },
    evaluationContext: SdkEvaluationRequest
  ): {
    reason: EvaluationReason;
    segment?: EvaluationSegmentResponse;
    targetingRule?: EvaluationTargetingRuleResponse;
    value: boolean;
  } {
    const config = flag.config;

    if (!config.enabled) {
      return { reason: "DISABLED", value: false };
    }

    const segmentRule = this.getSegmentTargetingRules(flag).find((rule) => rule.segment && matchesSegment(rule.segment, evaluationContext));

    if (segmentRule) {
      return {
        reason: "SEGMENT_TARGETING_MATCH",
        segment: segmentRule.segment ? this.toSegmentResponse(segmentRule.segment) : undefined,
        targetingRule: this.toTargetingRuleResponse(segmentRule),
        value: segmentRule.resultValue
      };
    }

    const targetingRule = findMatchingTargetingRule(this.getAttributeTargetingRules(flag), evaluationContext);

    if (targetingRule) {
      return {
        reason: "TARGETING_RULE_MATCH",
        targetingRule: this.toTargetingRuleResponse(targetingRule),
        value: targetingRule.resultValue
      };
    }

    const rolloutPercentage = config.rolloutPercentage ?? 100;

    if (rolloutPercentage <= 0) {
      return { reason: "PERCENTAGE_ROLLOUT", value: false };
    }

    if (rolloutPercentage >= 100) {
      return { reason: "STATIC", value: config.value };
    }

    const userId = typeof evaluationContext.userId === "string" ? evaluationContext.userId.trim() : "";

    if (!userId) {
      return { reason: "ROLLOUT_CONTEXT_MISSING", value: false };
    }

    const bucket = getPercentageRolloutBucket(context.environment.id, flag.key, userId);

    if (bucket >= rolloutPercentage) {
      return { reason: "PERCENTAGE_ROLLOUT", value: false };
    }

    return { reason: "PERCENTAGE_ROLLOUT", value: config.value };
  }

  private getOrderedTargetingRules(flag: CachedEvaluationFlag): CachedEvaluationTargetingRule[] {
    return [...flag.targetingRules].sort((first, second) => first.sortOrder - second.sortOrder);
  }

  private getSegmentTargetingRules(flag: CachedEvaluationFlag): CachedEvaluationTargetingRule[] {
    return this.getOrderedTargetingRules(flag).filter((rule) => rule.source === TargetingRuleSource.Segment && rule.segment);
  }

  private getAttributeTargetingRules(flag: CachedEvaluationFlag): DirectAttributeRule[] {
    return this.getOrderedTargetingRules(flag).filter((rule): rule is DirectAttributeRule => {
      return (
        rule.source === TargetingRuleSource.Attribute &&
        typeof rule.attribute === "string" &&
        rule.operator !== null &&
        rule.comparisonValue !== null
      );
    });
  }

  private toEnvironmentResponse(context: SdkEvaluationContext): EvaluationEnvironmentResponse {
    return {
      id: context.environment.id,
      key: context.environment.key,
      name: context.environment.name,
      projectId: context.environment.projectId
    };
  }

  private toSingleResponse(
    context: SdkEvaluationContext,
    key: string,
    value: boolean,
    reason: EvaluationReason,
    targetingRule?: EvaluationTargetingRuleResponse,
    segment?: EvaluationSegmentResponse
  ): SingleEvaluationResponse {
    return {
      environment: this.toEnvironmentResponse(context),
      evaluatedAt: new Date(),
      key,
      reason,
      segment,
      targetingRule,
      value
    };
  }

  private toTargetingRuleResponse(rule: CachedEvaluationTargetingRule): EvaluationTargetingRuleResponse {
    const response: EvaluationTargetingRuleResponse = {
      id: rule.id,
      source: rule.source
    };

    if (rule.attribute) {
      response.attribute = rule.attribute;
    }

    if (rule.operator) {
      response.operator = rule.operator;
    }

    return response;
  }

  private toSegmentResponse(segment: CachedEvaluationSegment): EvaluationSegmentResponse {
    return {
      id: segment.id,
      key: segment.key,
      name: segment.name
    };
  }
}
