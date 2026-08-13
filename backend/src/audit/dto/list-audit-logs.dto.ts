import { IsEnum, IsOptional, IsUUID } from "class-validator";
import { CursorPaginationDto } from "../../common/pagination/cursor-pagination.dto";
import { AuditAction } from "../audit-action.enum";
import { AuditResourceType } from "../audit-resource-type.enum";

export class ListAuditLogsDto extends CursorPaginationDto {
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsUUID()
  environmentId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsEnum(AuditResourceType)
  resourceType?: AuditResourceType;
}
