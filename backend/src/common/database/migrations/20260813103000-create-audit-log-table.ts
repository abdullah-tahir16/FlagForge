import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuditLogTable20260813103000 implements MigrationInterface {
  name = "CreateAuditLogTable20260813103000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."audit_logs_action_enum" AS ENUM (
        'PROJECT_CREATED',
        'PROJECT_UPDATED',
        'PROJECT_DELETED',
        'ENVIRONMENT_UPDATED',
        'FEATURE_FLAG_CREATED',
        'FEATURE_FLAG_UPDATED',
        'FEATURE_FLAG_DELETED',
        'FEATURE_FLAG_CONFIG_UPDATED',
        'SDK_KEY_CREATED',
        'SDK_KEY_REVOKED'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."audit_logs_resource_type_enum" AS ENUM (
        'PROJECT',
        'ENVIRONMENT',
        'FEATURE_FLAG',
        'ENVIRONMENT_FLAG_CONFIG',
        'SDK_KEY'
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "organization_id" uuid NOT NULL,
        "actor_user_id" uuid NOT NULL,
        "actor_email" character varying(320) NOT NULL,
        "action" "public"."audit_logs_action_enum" NOT NULL,
        "resource_type" "public"."audit_logs_resource_type_enum" NOT NULL,
        "resource_id" uuid NOT NULL,
        "project_id" uuid,
        "environment_id" uuid,
        "resource_name" character varying(240),
        "old_value" jsonb,
        "new_value" jsonb,
        "ip_address" character varying(80),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_audit_logs_organization" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_organization_created_at" ON "audit_logs" ("organization_id", "created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_project_id" ON "audit_logs" ("project_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_environment_id" ON "audit_logs" ("environment_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_resource" ON "audit_logs" ("resource_type", "resource_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_action" ON "audit_logs" ("action")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_action"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_resource"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_environment_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_project_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_organization_created_at"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TYPE "public"."audit_logs_resource_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
  }
}
