import type { AuditContext } from "../audit/audit-context";
import type { AuthenticatedUser } from "../auth/authenticated-user";
import type { CreateSegmentConditionDto } from "./dto/create-segment-condition.dto";
import type { CreateSegmentDto } from "./dto/create-segment.dto";
import type { ListSegmentsDto } from "./dto/list-segments.dto";
import type { ReorderSegmentConditionsDto } from "./dto/reorder-segment-conditions.dto";
import type { UpdateSegmentConditionDto } from "./dto/update-segment-condition.dto";
import type { UpdateSegmentDto } from "./dto/update-segment.dto";

export class ListSegmentsQuery {
  constructor(
    public readonly user: AuthenticatedUser,
    public readonly projectId: string,
    public readonly filters: ListSegmentsDto
  ) {}
}

export class ListSegmentOptionsQuery {
  constructor(
    public readonly user: AuthenticatedUser,
    public readonly projectId: string
  ) {}
}

export class GetSegmentQuery {
  constructor(
    public readonly user: AuthenticatedUser,
    public readonly projectId: string,
    public readonly segmentId: string
  ) {}
}

export class CreateSegmentCommand {
  constructor(
    public readonly user: AuthenticatedUser,
    public readonly projectId: string,
    public readonly dto: CreateSegmentDto,
    public readonly auditContext?: AuditContext
  ) {}
}

export class UpdateSegmentCommand {
  constructor(
    public readonly user: AuthenticatedUser,
    public readonly projectId: string,
    public readonly segmentId: string,
    public readonly dto: UpdateSegmentDto,
    public readonly auditContext?: AuditContext
  ) {}
}

export class DeleteSegmentCommand {
  constructor(
    public readonly user: AuthenticatedUser,
    public readonly projectId: string,
    public readonly segmentId: string,
    public readonly auditContext?: AuditContext
  ) {}
}

export class CreateSegmentConditionCommand {
  constructor(
    public readonly user: AuthenticatedUser,
    public readonly projectId: string,
    public readonly segmentId: string,
    public readonly dto: CreateSegmentConditionDto,
    public readonly auditContext?: AuditContext
  ) {}
}

export class UpdateSegmentConditionCommand {
  constructor(
    public readonly user: AuthenticatedUser,
    public readonly projectId: string,
    public readonly segmentId: string,
    public readonly conditionId: string,
    public readonly dto: UpdateSegmentConditionDto,
    public readonly auditContext?: AuditContext
  ) {}
}

export class DeleteSegmentConditionCommand {
  constructor(
    public readonly user: AuthenticatedUser,
    public readonly projectId: string,
    public readonly segmentId: string,
    public readonly conditionId: string,
    public readonly auditContext?: AuditContext
  ) {}
}

export class ReorderSegmentConditionsCommand {
  constructor(
    public readonly user: AuthenticatedUser,
    public readonly projectId: string,
    public readonly segmentId: string,
    public readonly dto: ReorderSegmentConditionsDto,
    public readonly auditContext?: AuditContext
  ) {}
}
