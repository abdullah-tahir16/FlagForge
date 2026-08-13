import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { AuditAction } from "./audit-action.enum";
import { AuditResourceType } from "./audit-resource-type.enum";
import type { AuditSnapshot } from "./audit-context";

@Entity({ name: "audit_logs" })
@Index("IDX_audit_logs_organization_created_at", ["organizationId", "createdAt"])
@Index("IDX_audit_logs_project_id", ["projectId"])
@Index("IDX_audit_logs_environment_id", ["environmentId"])
@Index("IDX_audit_logs_resource", ["resourceType", "resourceId"])
@Index("IDX_audit_logs_action", ["action"])
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "organization_id", type: "uuid" })
  organizationId!: string;

  @Column({ name: "actor_user_id", type: "uuid" })
  actorUserId!: string;

  @Column({ length: 320, name: "actor_email" })
  actorEmail!: string;

  @Column({ enum: AuditAction, type: "enum" })
  action!: AuditAction;

  @Column({ enum: AuditResourceType, name: "resource_type", type: "enum" })
  resourceType!: AuditResourceType;

  @Column({ name: "resource_id", type: "uuid" })
  resourceId!: string;

  @Column({ name: "project_id", nullable: true, type: "uuid" })
  projectId!: string | null;

  @Column({ name: "environment_id", nullable: true, type: "uuid" })
  environmentId!: string | null;

  @Column({ length: 240, name: "resource_name", nullable: true, type: "varchar" })
  resourceName!: string | null;

  @Column({ name: "old_value", nullable: true, type: "jsonb" })
  oldValue!: AuditSnapshot | null;

  @Column({ name: "new_value", nullable: true, type: "jsonb" })
  newValue!: AuditSnapshot | null;

  @Column({ length: 80, name: "ip_address", nullable: true, type: "varchar" })
  ipAddress!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
