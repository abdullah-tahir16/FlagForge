import * as argon2 from "argon2";
import { createHash } from "node:crypto";
import type { Repository } from "typeorm";
import dataSource from "../data-source";
import { createKeyFromName } from "../../fns/create-key-from-name";
import { AuditAction } from "../../../audit/audit-action.enum";
import type { AuditSnapshot } from "../../../audit/audit-context";
import { AuditLog } from "../../../audit/audit-log.entity";
import { AuditResourceType } from "../../../audit/audit-resource-type.enum";
import { RefreshSession } from "../../../auth/refresh-session.entity";
import { Environment } from "../../../environments/environment.entity";
import { EnvironmentFlagConfig } from "../../../feature-flags/environment-flag-config.entity";
import { FeatureFlag } from "../../../feature-flags/feature-flag.entity";
import { FeatureFlagType } from "../../../feature-flags/feature-flag-type.enum";
import { Organization } from "../../../organizations/organization.entity";
import { Project } from "../../../projects/project.entity";
import { defaultEnvironments } from "../../../projects/projects.service";
import { SdkKey } from "../../../sdk-keys/sdk-key.entity";
import { SegmentCondition } from "../../../segments/segment-condition.entity";
import { SegmentMatchMode } from "../../../segments/segment-match-mode.enum";
import { Segment } from "../../../segments/segment.entity";
import { TargetingRule } from "../../../targeting-rules/targeting-rule.entity";
import { TargetingRuleOperator } from "../../../targeting-rules/targeting-rule-operator.enum";
import { TargetingRuleSource } from "../../../targeting-rules/targeting-rule-source.enum";
import { User } from "../../../users/user.entity";
import { UserRole } from "../../../users/user-role.enum";

const demoUser = {
  email: "user@example.com",
  firstName: "Demo",
  lastName: "Owner",
  organizationName: "Demo Labs",
  password: "password123"
} as const;

const demoProject = {
  description: "Demo project for local feature flag setup.",
  name: "Checkout Platform"
} as const;

const demoSdkKey = {
  environmentKey: "development",
  name: "Local demo SDK key",
  secret: "ff_development_sk_local_demo_key"
} as const;

const demoSegments = [
  {
    conditions: [
      {
        attribute: "country",
        comparisonValue: "IT",
        operator: TargetingRuleOperator.Equals
      },
      {
        attribute: "plan",
        comparisonValue: "PREMIUM",
        operator: TargetingRuleOperator.Equals
      }
    ],
    description: "Premium customers in Italy for checkout experiments.",
    matchMode: SegmentMatchMode.MatchAll,
    name: "Premium Italian Users"
  },
  {
    conditions: [
      {
        attribute: "email",
        comparisonValue: "@company.com",
        operator: TargetingRuleOperator.EndsWith
      },
      {
        attribute: "role",
        comparisonValue: "STAFF",
        operator: TargetingRuleOperator.Equals
      }
    ],
    description: "Internal employees and staff accounts for early access.",
    matchMode: SegmentMatchMode.MatchAny,
    name: "Internal Employees"
  }
] as const;

const demoFlags = [
  {
    description: "Controls access to the redesigned checkout experience.",
    environmentConfigs: {
      development: {
        enabled: true,
        rolloutPercentage: 25,
        targetingRules: [
          {
            resultValue: true,
            segmentName: "Premium Italian Users",
            source: TargetingRuleSource.Segment
          },
          {
            attribute: "email",
            comparisonValue: "@company.com",
            operator: TargetingRuleOperator.EndsWith,
            source: TargetingRuleSource.Attribute,
            resultValue: true
          },
          {
            attribute: "country",
            comparisonValue: "IT",
            operator: TargetingRuleOperator.Equals,
            source: TargetingRuleSource.Attribute,
            resultValue: true
          }
        ],
        value: true
      },
      production: { enabled: false, rolloutPercentage: 0, value: false },
      staging: { enabled: true, rolloutPercentage: 50, value: true }
    },
    name: "New Checkout"
  },
  {
    description: "Enables the beta sidebar navigation treatment.",
    environmentConfigs: {
      development: {
        enabled: true,
        rolloutPercentage: 100,
        targetingRules: [
          {
            attribute: "plan",
            comparisonValue: "PREMIUM",
            operator: TargetingRuleOperator.Equals,
            source: TargetingRuleSource.Attribute,
            resultValue: true
          }
        ],
        value: true
      },
      production: { enabled: true, rolloutPercentage: 100, value: false },
      staging: { enabled: true, rolloutPercentage: 100, value: true }
    },
    name: "Beta Navigation"
  }
] as const;

const seedDemoUser = async (): Promise<void> => {
  await dataSource.initialize();

  const environments = dataSource.getRepository(Environment);
  const environmentFlagConfigs = dataSource.getRepository(EnvironmentFlagConfig);
  const featureFlags = dataSource.getRepository(FeatureFlag);
  const auditLogs = dataSource.getRepository(AuditLog);
  const organizations = dataSource.getRepository(Organization);
  const projects = dataSource.getRepository(Project);
  const segments = dataSource.getRepository(Segment);
  const segmentConditions = dataSource.getRepository(SegmentCondition);
  const sdkKeys = dataSource.getRepository(SdkKey);
  const targetingRules = dataSource.getRepository(TargetingRule);
  const users = dataSource.getRepository(User);
  const refreshSessions = dataSource.getRepository(RefreshSession);
  const organizationKey = createKeyFromName(demoUser.organizationName);
  const projectKey = createKeyFromName(demoProject.name);

  let organization = await organizations.findOne({ where: { key: organizationKey } });

  if (!organization) {
    organization = await organizations.save(
      organizations.create({
        key: organizationKey,
        name: demoUser.organizationName
      })
    );
  }

  const passwordHash = await argon2.hash(demoUser.password);
  let user = await users.findOne({ where: { email: demoUser.email } });

  if (!user) {
    user = users.create({
      email: demoUser.email,
      firstName: demoUser.firstName,
      lastName: demoUser.lastName,
      organizationId: organization.id,
      passwordHash,
      role: UserRole.Owner
    });
  } else {
    user.firstName = demoUser.firstName;
    user.lastName = demoUser.lastName;
    user.organizationId = organization.id;
    user.passwordHash = passwordHash;
    user.role = UserRole.Owner;
  }

  const savedUser = await users.save(user);
  let project = await projects.findOne({ where: { key: projectKey, organizationId: organization.id } });

  if (!project) {
    project = projects.create({
      description: demoProject.description,
      key: projectKey,
      name: demoProject.name,
      organizationId: organization.id
    });
  } else {
    project.description = demoProject.description;
    project.name = demoProject.name;
  }

  const savedProject = await projects.save(project);

  const savedEnvironments: Environment[] = [];

  for (const defaultEnvironment of defaultEnvironments) {
    let existingEnvironment = await environments.findOne({
      where: { key: defaultEnvironment.key, projectId: savedProject.id }
    });

    if (!existingEnvironment) {
      existingEnvironment = await environments.save(
        environments.create({
          ...defaultEnvironment,
          projectId: savedProject.id
        })
      );
    } else {
      existingEnvironment.name = defaultEnvironment.name;
      existingEnvironment.sortOrder = defaultEnvironment.sortOrder;
      existingEnvironment = await environments.save(existingEnvironment);
    }

    savedEnvironments.push(existingEnvironment);
  }

  const savedSegmentsByName = new Map<string, Segment>();

  for (const demoSegment of demoSegments) {
    const key = createKeyFromName(demoSegment.name);
    let existingSegment = await segments.findOne({ where: { key, projectId: savedProject.id } });

    if (!existingSegment) {
      existingSegment = segments.create({
        key,
        projectId: savedProject.id
      });
    }

    existingSegment.description = demoSegment.description;
    existingSegment.matchMode = demoSegment.matchMode;
    existingSegment.name = demoSegment.name;
    const savedSegment = await segments.save(existingSegment);
    savedSegmentsByName.set(demoSegment.name, savedSegment);

    for (const [index, demoCondition] of demoSegment.conditions.entries()) {
      let existingCondition = await segmentConditions.findOne({
        where: {
          attribute: demoCondition.attribute,
          operator: demoCondition.operator,
          segmentId: savedSegment.id
        }
      });

      if (!existingCondition) {
        existingCondition = segmentConditions.create({
          attribute: demoCondition.attribute,
          operator: demoCondition.operator,
          segmentId: savedSegment.id
        });
      }

      existingCondition.comparisonValue = demoCondition.comparisonValue;
      existingCondition.sortOrder = index + 1;
      await segmentConditions.save(existingCondition);
    }
  }

  for (const demoFlag of demoFlags) {
    const key = createKeyFromName(demoFlag.name);
    let existingFlag = await featureFlags.findOne({ where: { key, projectId: savedProject.id } });

    if (!existingFlag) {
      existingFlag = featureFlags.create({
        description: demoFlag.description,
        key,
        name: demoFlag.name,
        projectId: savedProject.id,
        type: FeatureFlagType.Boolean
      });
    } else {
      existingFlag.description = demoFlag.description;
      existingFlag.name = demoFlag.name;
      existingFlag.type = FeatureFlagType.Boolean;
    }

    const savedFlag = await featureFlags.save(existingFlag);

    for (const environment of savedEnvironments) {
      const desiredConfig = demoFlag.environmentConfigs[environment.key as keyof typeof demoFlag.environmentConfigs] ?? {
        enabled: false,
        rolloutPercentage: 100,
        value: false
      };
      let existingConfig = await environmentFlagConfigs.findOne({
        where: { environmentId: environment.id, featureFlagId: savedFlag.id }
      });

      if (!existingConfig) {
        existingConfig = environmentFlagConfigs.create({
          environmentId: environment.id,
          featureFlagId: savedFlag.id
        });
      }

      existingConfig.enabled = desiredConfig.enabled;
      existingConfig.rolloutPercentage = desiredConfig.rolloutPercentage;
      existingConfig.value = desiredConfig.value;
      const savedConfig = await environmentFlagConfigs.save(existingConfig);

      if ("targetingRules" in desiredConfig) {
        for (const [index, desiredRule] of desiredConfig.targetingRules.entries()) {
          const source = desiredRule.source ?? TargetingRuleSource.Attribute;
          const desiredSegment =
            source === TargetingRuleSource.Segment && "segmentName" in desiredRule
              ? savedSegmentsByName.get(desiredRule.segmentName)
              : null;
          let existingRule =
            source === TargetingRuleSource.Segment && desiredSegment
              ? await targetingRules.findOne({
                  where: {
                    environmentFlagConfigId: savedConfig.id,
                    segmentId: desiredSegment.id,
                    source
                  }
                })
              : "attribute" in desiredRule && "operator" in desiredRule
                ? await targetingRules.findOne({
                    where: {
                      attribute: desiredRule.attribute,
                      environmentFlagConfigId: savedConfig.id,
                      operator: desiredRule.operator,
                      source
                    }
                  })
                : null;

          if (!existingRule) {
            existingRule = targetingRules.create({
              environmentFlagConfigId: savedConfig.id,
              source
            });
          }

          if (source === TargetingRuleSource.Segment) {
            if (!desiredSegment) {
              continue;
            }

            existingRule.attribute = null;
            existingRule.comparisonValue = null;
            existingRule.operator = null;
            existingRule.segmentId = desiredSegment.id;
          } else if ("attribute" in desiredRule && "operator" in desiredRule && "comparisonValue" in desiredRule) {
            existingRule.attribute = desiredRule.attribute;
            existingRule.comparisonValue = desiredRule.comparisonValue;
            existingRule.operator = desiredRule.operator;
            existingRule.segmentId = null;
          }

          existingRule.resultValue = desiredRule.resultValue;
          existingRule.sortOrder = index + 1;
          existingRule.source = source;
          await targetingRules.save(existingRule);
        }
      }
    }
  }

  const sdkKeyEnvironment = savedEnvironments.find((environment) => environment.key === demoSdkKey.environmentKey);

  let savedDemoSdkKey: SdkKey | null = null;

  if (sdkKeyEnvironment) {
    const keyHash = createHash("sha256").update(demoSdkKey.secret).digest("hex");
    let existingSdkKey = await sdkKeys.findOne({ where: { keyHash } });

    if (!existingSdkKey) {
      existingSdkKey = sdkKeys.create({
        environmentId: sdkKeyEnvironment.id,
        keyHash
      });
    }

    existingSdkKey.environmentId = sdkKeyEnvironment.id;
    existingSdkKey.keyPrefix = demoSdkKey.secret.slice(0, 20);
    existingSdkKey.name = demoSdkKey.name;
    existingSdkKey.revokedAt = null;
    savedDemoSdkKey = await sdkKeys.save(existingSdkKey);
  }

  const checkoutFlag = await featureFlags.findOne({
    where: { key: createKeyFromName("New Checkout"), projectId: savedProject.id }
  });
  const developmentEnvironment = savedEnvironments.find((environment) => environment.key === "development");

  if (checkoutFlag && developmentEnvironment) {
    const checkoutConfig = await environmentFlagConfigs.findOne({
      where: { environmentId: developmentEnvironment.id, featureFlagId: checkoutFlag.id }
    });

    if (checkoutConfig) {
      await seedAuditLog(
        auditLogs,
        {
          action: AuditAction.FeatureFlagConfigUpdated,
          actorEmail: savedUser.email,
          actorUserId: savedUser.id,
          environmentId: developmentEnvironment.id,
          newValue: {
            enabled: checkoutConfig.enabled,
            rolloutPercentage: checkoutConfig.rolloutPercentage,
            value: checkoutConfig.value
          },
          oldValue: { enabled: false, rolloutPercentage: 100, value: false },
          organizationId: organization.id,
          projectId: savedProject.id,
          resourceId: checkoutConfig.id,
          resourceName: `${checkoutFlag.name} in ${developmentEnvironment.name}`,
          resourceType: AuditResourceType.EnvironmentFlagConfig
        }
      );
    }
  }

  if (savedDemoSdkKey && developmentEnvironment) {
    await seedAuditLog(
      auditLogs,
      {
        action: AuditAction.SdkKeyCreated,
        actorEmail: savedUser.email,
        actorUserId: savedUser.id,
        environmentId: developmentEnvironment.id,
        newValue: {
          environmentId: developmentEnvironment.id,
          keyPrefix: savedDemoSdkKey.keyPrefix,
          name: savedDemoSdkKey.name,
          revokedAt: null
        },
        oldValue: null,
        organizationId: organization.id,
        projectId: savedProject.id,
        resourceId: savedDemoSdkKey.id,
        resourceName: savedDemoSdkKey.name,
        resourceType: AuditResourceType.SdkKey
      }
    );
  }

  await refreshSessions.delete({ userId: savedUser.id });

  console.log(`Seeded demo user: ${demoUser.email} / ${demoUser.password}`);
  console.log(`Seeded demo project: ${demoProject.name}`);
  console.log(`Seeded demo feature flags: ${demoFlags.map((flag) => flag.name).join(", ")}`);
  console.log(`Seeded demo segments: ${demoSegments.map((segment) => segment.name).join(", ")}`);
  console.log("Seeded demo targeting rules for development flags");
  console.log(`Seeded demo SDK key (${demoSdkKey.environmentKey}): ${demoSdkKey.secret}`);
};

const seedAuditLog = async (
  auditLogs: Repository<AuditLog>,
  input: {
    action: AuditAction;
    actorEmail: string;
    actorUserId: string;
    environmentId: string | null;
    newValue: AuditSnapshot | null;
    oldValue: AuditSnapshot | null;
    organizationId: string;
    projectId: string | null;
    resourceId: string;
    resourceName: string;
    resourceType: AuditResourceType;
  }
): Promise<void> => {
  const existingAuditLog = await auditLogs.findOne({
    where: {
      action: input.action,
      organizationId: input.organizationId,
      resourceId: input.resourceId,
      resourceType: input.resourceType
    }
  });

  if (existingAuditLog) {
    existingAuditLog.actorEmail = input.actorEmail;
    existingAuditLog.actorUserId = input.actorUserId;
    existingAuditLog.environmentId = input.environmentId;
    existingAuditLog.newValue = input.newValue;
    existingAuditLog.oldValue = input.oldValue;
    existingAuditLog.projectId = input.projectId;
    existingAuditLog.resourceName = input.resourceName;
    await auditLogs.save(existingAuditLog);
    return;
  }

  await auditLogs.save(
    auditLogs.create({
      ...input,
      ipAddress: "127.0.0.1"
    })
  );
};

seedDemoUser()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });
