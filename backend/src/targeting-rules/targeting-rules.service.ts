import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { AuditAction } from "../audit/audit-action.enum";
import type { AuditContext, AuditSnapshot } from "../audit/audit-context";
import { AuditResourceType } from "../audit/audit-resource-type.enum";
import { AuditService } from "../audit/audit.service";
import type { AuthenticatedUser } from "../auth/authenticated-user";
import { Environment } from "../environments/environment.entity";
import { EnvironmentFlagConfig } from "../feature-flags/environment-flag-config.entity";
import { FeatureFlag } from "../feature-flags/feature-flag.entity";
import { ProjectsService } from "../projects/projects.service";
import { CreateTargetingRuleDto } from "./dto/create-targeting-rule.dto";
import { TargetingRuleResponse } from "./dto/targeting-rule-response.dto";
import { ReorderTargetingRulesDto } from "./dto/reorder-targeting-rules.dto";
import { UpdateTargetingRuleDto } from "./dto/update-targeting-rule.dto";
import type { TargetingComparisonValue } from "./targeting-rule-comparison-value";
import { TargetingRule } from "./targeting-rule.entity";
import { TargetingRuleOperator } from "./targeting-rule-operator.enum";
import { validateTargetingComparisonValue } from "./targeting-rule-matcher";

interface ConfigContext {
  config: EnvironmentFlagConfig;
  environment: Environment;
  featureFlag: FeatureFlag;
}

@Injectable()
export class TargetingRulesService {
  constructor(
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
    private readonly projectsService: ProjectsService,
    @InjectRepository(Environment)
    private readonly environmentsRepository: Repository<Environment>,
    @InjectRepository(EnvironmentFlagConfig)
    private readonly environmentFlagConfigsRepository: Repository<EnvironmentFlagConfig>,
    @InjectRepository(FeatureFlag)
    private readonly featureFlagsRepository: Repository<FeatureFlag>,
    @InjectRepository(TargetingRule)
    private readonly targetingRulesRepository: Repository<TargetingRule>
  ) {}

  async findAll(
    user: AuthenticatedUser,
    projectId: string,
    flagId: string,
    environmentId: string
  ): Promise<TargetingRuleResponse[]> {
    const { config } = await this.findConfigContext(user, projectId, flagId, environmentId);
    const rules = await this.findRulesForConfig(config.id);

    return rules.map((rule) => this.toResponse(rule));
  }

  async create(
    user: AuthenticatedUser,
    projectId: string,
    flagId: string,
    environmentId: string,
    dto: CreateTargetingRuleDto,
    auditContext?: AuditContext
  ): Promise<TargetingRuleResponse> {
    const { config, environment, featureFlag } = await this.findConfigContext(user, projectId, flagId, environmentId);
    const normalized = this.normalizeRuleInput(dto);
    const sortOrder = await this.getNextSortOrder(config.id);
    const rule = await this.targetingRulesRepository.save(
      this.targetingRulesRepository.create({
        ...normalized,
        environmentFlagConfigId: config.id,
        sortOrder
      })
    );

    await this.auditService.record(
      user,
      {
        action: AuditAction.TargetingRuleCreated,
        environmentId,
        newValue: this.ruleSnapshot(rule),
        oldValue: null,
        projectId,
        resourceId: rule.id,
        resourceName: this.getRuleResourceName(featureFlag, environment, rule),
        resourceType: AuditResourceType.TargetingRule
      },
      auditContext
    );

    return this.toResponse(rule);
  }

  async update(
    user: AuthenticatedUser,
    projectId: string,
    flagId: string,
    environmentId: string,
    ruleId: string,
    dto: UpdateTargetingRuleDto,
    auditContext?: AuditContext
  ): Promise<TargetingRuleResponse> {
    const { config, environment, featureFlag } = await this.findConfigContext(user, projectId, flagId, environmentId);
    const rule = await this.findRuleForConfig(config.id, ruleId);
    const oldValue = this.changedRuleSnapshot(rule, dto);
    const nextRule = {
      attribute: dto.attribute ?? rule.attribute,
      comparisonValue: dto.comparisonValue ?? rule.comparisonValue,
      operator: dto.operator ?? rule.operator,
      resultValue: dto.resultValue ?? rule.resultValue
    };
    const normalized = this.normalizeRuleInput(nextRule);

    rule.attribute = normalized.attribute;
    rule.comparisonValue = normalized.comparisonValue;
    rule.operator = normalized.operator;
    rule.resultValue = normalized.resultValue;

    const savedRule = await this.targetingRulesRepository.save(rule);
    await this.auditService.record(
      user,
      {
        action: AuditAction.TargetingRuleUpdated,
        environmentId,
        newValue: this.changedRuleSnapshot(savedRule, dto),
        oldValue,
        projectId,
        resourceId: savedRule.id,
        resourceName: this.getRuleResourceName(featureFlag, environment, savedRule),
        resourceType: AuditResourceType.TargetingRule
      },
      auditContext
    );

    return this.toResponse(savedRule);
  }

  async remove(
    user: AuthenticatedUser,
    projectId: string,
    flagId: string,
    environmentId: string,
    ruleId: string,
    auditContext?: AuditContext
  ): Promise<void> {
    const { config, environment, featureFlag } = await this.findConfigContext(user, projectId, flagId, environmentId);
    const rule = await this.findRuleForConfig(config.id, ruleId);

    await this.dataSource.transaction(async (manager) => {
      const rulesRepository = manager.getRepository(TargetingRule);
      await rulesRepository.remove(rule);
      await this.resequenceRules(config.id, rulesRepository);
    });

    await this.auditService.record(
      user,
      {
        action: AuditAction.TargetingRuleDeleted,
        environmentId,
        newValue: null,
        oldValue: this.ruleSnapshot(rule),
        projectId,
        resourceId: rule.id,
        resourceName: this.getRuleResourceName(featureFlag, environment, rule),
        resourceType: AuditResourceType.TargetingRule
      },
      auditContext
    );
  }

  async reorder(
    user: AuthenticatedUser,
    projectId: string,
    flagId: string,
    environmentId: string,
    dto: ReorderTargetingRulesDto,
    auditContext?: AuditContext
  ): Promise<TargetingRuleResponse[]> {
    const { config, environment, featureFlag } = await this.findConfigContext(user, projectId, flagId, environmentId);
    const before = await this.findRulesForConfig(config.id);
    const beforeIds = before.map((rule) => rule.id);
    this.assertCompleteReorder(beforeIds, dto.ruleIds);

    const reorderedRules = await this.dataSource.transaction(async (manager) => {
      const rulesRepository = manager.getRepository(TargetingRule);

      for (const [index, ruleId] of dto.ruleIds.entries()) {
        await rulesRepository.update({ environmentFlagConfigId: config.id, id: ruleId }, { sortOrder: index + 1 });
      }

      return rulesRepository.find({
        order: { sortOrder: "ASC" },
        where: { environmentFlagConfigId: config.id }
      });
    });

    await this.auditService.record(
      user,
      {
        action: AuditAction.TargetingRuleReordered,
        environmentId,
        newValue: { ruleIds: reorderedRules.map((rule) => rule.id) },
        oldValue: { ruleIds: beforeIds },
        projectId,
        resourceId: config.id,
        resourceName: `${featureFlag.name} rules in ${environment.name}`,
        resourceType: AuditResourceType.TargetingRule
      },
      auditContext
    );

    return reorderedRules.map((rule) => this.toResponse(rule));
  }

  private assertCompleteReorder(existingIds: string[], requestedIds: string[]): void {
    const existingSet = new Set(existingIds);
    const requestedSet = new Set(requestedIds);

    if (existingIds.length !== requestedIds.length || existingSet.size !== requestedSet.size) {
      throw new BadRequestException("Reorder payload must include every targeting rule exactly once");
    }

    const allIdsMatch = existingIds.every((id) => requestedSet.has(id)) && requestedIds.every((id) => existingSet.has(id));

    if (!allIdsMatch) {
      throw new BadRequestException("Reorder payload contains unknown targeting rules");
    }
  }

  private async findConfigContext(
    user: AuthenticatedUser,
    projectId: string,
    flagId: string,
    environmentId: string
  ): Promise<ConfigContext> {
    await this.projectsService.findProjectForUser(user, projectId);

    const [environment, featureFlag, config] = await Promise.all([
      this.environmentsRepository.findOne({ where: { id: environmentId, projectId } }),
      this.featureFlagsRepository.findOne({ where: { id: flagId, projectId } }),
      this.environmentFlagConfigsRepository.findOne({ where: { environmentId, featureFlagId: flagId } })
    ]);

    if (!environment) {
      throw new NotFoundException("Environment was not found");
    }

    if (!featureFlag) {
      throw new NotFoundException("Feature flag was not found");
    }

    if (!config) {
      throw new NotFoundException("Environment flag configuration was not found");
    }

    return { config, environment, featureFlag };
  }

  private async findRuleForConfig(environmentFlagConfigId: string, ruleId: string): Promise<TargetingRule> {
    const rule = await this.targetingRulesRepository.findOne({
      where: { environmentFlagConfigId, id: ruleId }
    });

    if (!rule) {
      throw new NotFoundException("Targeting rule was not found");
    }

    return rule;
  }

  private findRulesForConfig(environmentFlagConfigId: string): Promise<TargetingRule[]> {
    return this.targetingRulesRepository.find({
      order: { sortOrder: "ASC" },
      where: { environmentFlagConfigId }
    });
  }

  private async getNextSortOrder(environmentFlagConfigId: string): Promise<number> {
    const result = await this.targetingRulesRepository
      .createQueryBuilder("targetingRule")
      .select("COALESCE(MAX(targetingRule.sort_order), 0)", "max")
      .where("targetingRule.environment_flag_config_id = :environmentFlagConfigId", { environmentFlagConfigId })
      .getRawOne<{ max: number | string }>();

    return Number(result?.max ?? 0) + 1;
  }

  private getRuleResourceName(featureFlag: FeatureFlag, environment: Environment, rule: TargetingRule): string {
    return `${featureFlag.name} ${rule.attribute} ${rule.operator} in ${environment.name}`;
  }

  private normalizeRuleInput(input: {
    attribute: string;
    comparisonValue: TargetingComparisonValue;
    operator: TargetingRuleOperator;
    resultValue: boolean;
  }): Pick<TargetingRule, "attribute" | "comparisonValue" | "operator" | "resultValue"> {
    const attribute = input.attribute.trim();
    validateTargetingComparisonValue(input.operator, input.comparisonValue);

    return {
      attribute,
      comparisonValue: input.comparisonValue,
      operator: input.operator,
      resultValue: input.resultValue
    };
  }

  private async resequenceRules(environmentFlagConfigId: string, rulesRepository: Repository<TargetingRule>): Promise<void> {
    const rules = await rulesRepository.find({ order: { sortOrder: "ASC" }, where: { environmentFlagConfigId } });

    for (const [index, rule] of rules.entries()) {
      if (rule.sortOrder !== index + 1) {
        rule.sortOrder = index + 1;
        await rulesRepository.save(rule);
      }
    }
  }

  private changedRuleSnapshot(rule: TargetingRule, dto: UpdateTargetingRuleDto): AuditSnapshot {
    const snapshot: AuditSnapshot = {};

    if (dto.attribute !== undefined) {
      snapshot.attribute = rule.attribute;
    }

    if (dto.operator !== undefined) {
      snapshot.operator = rule.operator;
    }

    if (dto.comparisonValue !== undefined) {
      snapshot.comparisonValue = rule.comparisonValue;
    }

    if (dto.resultValue !== undefined) {
      snapshot.resultValue = rule.resultValue;
    }

    return snapshot;
  }

  private ruleSnapshot(rule: TargetingRule): AuditSnapshot {
    return {
      attribute: rule.attribute,
      comparisonValue: rule.comparisonValue,
      operator: rule.operator,
      resultValue: rule.resultValue,
      sortOrder: rule.sortOrder
    };
  }

  private toResponse(rule: TargetingRule): TargetingRuleResponse {
    return {
      attribute: rule.attribute,
      comparisonValue: rule.comparisonValue,
      createdAt: rule.createdAt,
      environmentFlagConfigId: rule.environmentFlagConfigId,
      id: rule.id,
      operator: rule.operator,
      resultValue: rule.resultValue,
      sortOrder: rule.sortOrder,
      updatedAt: rule.updatedAt
    };
  }
}
