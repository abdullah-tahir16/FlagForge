import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EnvironmentFlagConfig } from "../feature-flags/environment-flag-config.entity";
import { FeatureFlag } from "../feature-flags/feature-flag.entity";
import { SdkEvaluationRequest } from "./dto/evaluation-request.dto";
import {
  AllEvaluationsResponse,
  EvaluationEnvironmentResponse,
  EvaluationReason,
  SingleEvaluationResponse
} from "./dto/evaluation-response.dto";
import { getPercentageRolloutBucket } from "./percentage-rollout";
import { SdkEvaluationContext } from "./sdk-evaluation-context";

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(EnvironmentFlagConfig)
    private readonly environmentFlagConfigsRepository: Repository<EnvironmentFlagConfig>,
    @InjectRepository(FeatureFlag)
    private readonly featureFlagsRepository: Repository<FeatureFlag>
  ) {}

  async evaluateOne(
    context: SdkEvaluationContext,
    flagKey: string,
    evaluationContext: SdkEvaluationRequest = {}
  ): Promise<SingleEvaluationResponse> {
    const featureFlag = await this.featureFlagsRepository.findOne({
      where: {
        key: flagKey,
        projectId: context.environment.projectId
      }
    });

    if (!featureFlag) {
      return this.toSingleResponse(context, flagKey, false, "FLAG_NOT_FOUND");
    }

    const config = await this.environmentFlagConfigsRepository.findOne({
      where: {
        environmentId: context.environment.id,
        featureFlagId: featureFlag.id
      }
    });

    if (!config) {
      return this.toSingleResponse(context, featureFlag.key, false, "CONFIG_NOT_FOUND");
    }

    const evaluated = this.evaluateConfig(context, featureFlag.key, config, evaluationContext);

    return this.toSingleResponse(context, featureFlag.key, evaluated.value, evaluated.reason);
  }

  async evaluateAll(
    context: SdkEvaluationContext,
    evaluationContext: SdkEvaluationRequest = {}
  ): Promise<AllEvaluationsResponse> {
    const featureFlags = await this.featureFlagsRepository
      .createQueryBuilder("featureFlag")
      .leftJoinAndSelect(
        "featureFlag.environmentConfigs",
        "environmentConfig",
        "environmentConfig.environment_id = :environmentId",
        { environmentId: context.environment.id }
      )
      .where("featureFlag.project_id = :projectId", { projectId: context.environment.projectId })
      .orderBy("featureFlag.key", "ASC")
      .getMany();
    const flags: Record<string, boolean> = {};
    const reasons: AllEvaluationsResponse["reasons"] = {};

    featureFlags.forEach((featureFlag) => {
      const config = featureFlag.environmentConfigs?.[0];
      const evaluated = config
        ? this.evaluateConfig(context, featureFlag.key, config, evaluationContext)
        : { reason: "CONFIG_NOT_FOUND" as const, value: false };

      flags[featureFlag.key] = evaluated.value;
      reasons[featureFlag.key] = evaluated;
    });

    return {
      environment: this.toEnvironmentResponse(context),
      evaluatedAt: new Date(),
      flags,
      reasons
    };
  }

  private evaluateConfig(
    context: SdkEvaluationContext,
    flagKey: string,
    config: EnvironmentFlagConfig,
    evaluationContext: SdkEvaluationRequest
  ): { reason: EvaluationReason; value: boolean } {
    if (!config.enabled) {
      return { reason: "DISABLED", value: false };
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

    const bucket = getPercentageRolloutBucket(context.environment.id, flagKey, userId);

    if (bucket >= rolloutPercentage) {
      return { reason: "PERCENTAGE_ROLLOUT", value: false };
    }

    return { reason: "PERCENTAGE_ROLLOUT", value: config.value };
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
    reason: EvaluationReason
  ): SingleEvaluationResponse {
    return {
      environment: this.toEnvironmentResponse(context),
      evaluatedAt: new Date(),
      key,
      reason,
      value
    };
  }
}
