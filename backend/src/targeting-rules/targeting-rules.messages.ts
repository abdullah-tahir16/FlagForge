import type { AuditContext } from "../audit/audit-context";
import type { AuthenticatedUser } from "../auth/authenticated-user";
import type { CreateTargetingRuleDto } from "./dto/create-targeting-rule.dto";
import type { ReorderTargetingRulesDto } from "./dto/reorder-targeting-rules.dto";
import type { UpdateTargetingRuleDto } from "./dto/update-targeting-rule.dto";

export class ListTargetingRulesQuery {
  constructor(
    public readonly user: AuthenticatedUser,
    public readonly projectId: string,
    public readonly flagId: string,
    public readonly environmentId: string
  ) {}
}

export class CreateTargetingRuleCommand {
  constructor(
    public readonly user: AuthenticatedUser,
    public readonly projectId: string,
    public readonly flagId: string,
    public readonly environmentId: string,
    public readonly dto: CreateTargetingRuleDto,
    public readonly auditContext?: AuditContext
  ) {}
}

export class UpdateTargetingRuleCommand {
  constructor(
    public readonly user: AuthenticatedUser,
    public readonly projectId: string,
    public readonly flagId: string,
    public readonly environmentId: string,
    public readonly ruleId: string,
    public readonly dto: UpdateTargetingRuleDto,
    public readonly auditContext?: AuditContext
  ) {}
}

export class DeleteTargetingRuleCommand {
  constructor(
    public readonly user: AuthenticatedUser,
    public readonly projectId: string,
    public readonly flagId: string,
    public readonly environmentId: string,
    public readonly ruleId: string,
    public readonly auditContext?: AuditContext
  ) {}
}

export class ReorderTargetingRulesCommand {
  constructor(
    public readonly user: AuthenticatedUser,
    public readonly projectId: string,
    public readonly flagId: string,
    public readonly environmentId: string,
    public readonly dto: ReorderTargetingRulesDto,
    public readonly auditContext?: AuditContext
  ) {}
}
