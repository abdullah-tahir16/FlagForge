import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import { AuditAction } from "../audit-action.enum";
import { AuditResourceType } from "../audit-resource-type.enum";

export class ListAuditLogsDto {
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsUUID()
  environmentId?: string;

  @IsOptional()
  @IsInt()
  @Max(100)
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsEnum(AuditResourceType)
  resourceType?: AuditResourceType;
}
