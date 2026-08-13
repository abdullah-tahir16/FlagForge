import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTargetingRulesTable20260813123000 implements MigrationInterface {
  name = "CreateTargetingRulesTable20260813123000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."audit_logs_action_enum"
      ADD VALUE IF NOT EXISTS 'TARGETING_RULE_CREATED'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."audit_logs_action_enum"
      ADD VALUE IF NOT EXISTS 'TARGETING_RULE_UPDATED'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."audit_logs_action_enum"
      ADD VALUE IF NOT EXISTS 'TARGETING_RULE_DELETED'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."audit_logs_action_enum"
      ADD VALUE IF NOT EXISTS 'TARGETING_RULE_REORDERED'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."audit_logs_resource_type_enum"
      ADD VALUE IF NOT EXISTS 'TARGETING_RULE'
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."targeting_rules_operator_enum" AS ENUM (
        'EQUALS',
        'NOT_EQUALS',
        'CONTAINS',
        'NOT_CONTAINS',
        'STARTS_WITH',
        'ENDS_WITH',
        'IN',
        'NOT_IN',
        'GREATER_THAN',
        'GREATER_THAN_OR_EQUAL',
        'LESS_THAN',
        'LESS_THAN_OR_EQUAL'
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "targeting_rules" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "environment_flag_config_id" uuid NOT NULL,
        "attribute" character varying(80) NOT NULL,
        "operator" "public"."targeting_rules_operator_enum" NOT NULL,
        "comparison_value" jsonb NOT NULL,
        "result_value" boolean NOT NULL,
        "sort_order" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_targeting_rules_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_targeting_rules_environment_flag_config" FOREIGN KEY ("environment_flag_config_id") REFERENCES "environment_flag_configs"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_targeting_rules_environment_config_order" ON "targeting_rules" ("environment_flag_config_id", "sort_order")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_targeting_rules_environment_config_order"`);
    await queryRunner.query(`DROP TABLE "targeting_rules"`);
    await queryRunner.query(`DROP TYPE "public"."targeting_rules_operator_enum"`);
  }
}
