import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSegmentsAndExtendTargetingRules20260813133000 implements MigrationInterface {
  name = "CreateSegmentsAndExtendTargetingRules20260813133000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'SEGMENT_CREATED'`);
    await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'SEGMENT_UPDATED'`);
    await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'SEGMENT_DELETED'`);
    await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'SEGMENT_CONDITION_CREATED'`);
    await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'SEGMENT_CONDITION_UPDATED'`);
    await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'SEGMENT_CONDITION_DELETED'`);
    await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'SEGMENT_CONDITION_REORDERED'`);
    await queryRunner.query(`ALTER TYPE "public"."audit_logs_resource_type_enum" ADD VALUE IF NOT EXISTS 'SEGMENT'`);
    await queryRunner.query(`ALTER TYPE "public"."audit_logs_resource_type_enum" ADD VALUE IF NOT EXISTS 'SEGMENT_CONDITION'`);
    await queryRunner.query(`CREATE TYPE "public"."segments_match_mode_enum" AS ENUM ('MATCH_ALL', 'MATCH_ANY')`);
    await queryRunner.query(`CREATE TYPE "public"."targeting_rules_source_enum" AS ENUM ('ATTRIBUTE', 'SEGMENT')`);
    await queryRunner.query(`
      CREATE TABLE "segments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "project_id" uuid NOT NULL,
        "name" character varying(160) NOT NULL,
        "key" character varying(120) NOT NULL,
        "description" text,
        "match_mode" "public"."segments_match_mode_enum" NOT NULL DEFAULT 'MATCH_ALL',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_segments_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_segments_project_key" UNIQUE ("project_id", "key"),
        CONSTRAINT "FK_segments_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_segments_project_id" ON "segments" ("project_id")`);
    await queryRunner.query(`
      CREATE TABLE "segment_conditions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "segment_id" uuid NOT NULL,
        "attribute" character varying(80) NOT NULL,
        "operator" "public"."targeting_rules_operator_enum" NOT NULL,
        "comparison_value" jsonb NOT NULL,
        "sort_order" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_segment_conditions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_segment_conditions_segment" FOREIGN KEY ("segment_id") REFERENCES "segments"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_segment_conditions_segment_order" ON "segment_conditions" ("segment_id", "sort_order")`
    );
    await queryRunner.query(`
      ALTER TABLE "targeting_rules"
      ADD "source" "public"."targeting_rules_source_enum" NOT NULL DEFAULT 'ATTRIBUTE'
    `);
    await queryRunner.query(`ALTER TABLE "targeting_rules" ADD "segment_id" uuid`);
    await queryRunner.query(`
      ALTER TABLE "targeting_rules"
      ADD CONSTRAINT "FK_targeting_rules_segment" FOREIGN KEY ("segment_id") REFERENCES "segments"("id") ON DELETE RESTRICT
    `);
    await queryRunner.query(`CREATE INDEX "IDX_targeting_rules_segment_id" ON "targeting_rules" ("segment_id")`);
    await queryRunner.query(`ALTER TABLE "targeting_rules" ALTER COLUMN "attribute" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "targeting_rules" ALTER COLUMN "operator" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "targeting_rules" ALTER COLUMN "comparison_value" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "targeting_rules" SET "attribute" = 'unknown' WHERE "attribute" IS NULL`);
    await queryRunner.query(`UPDATE "targeting_rules" SET "operator" = 'EQUALS' WHERE "operator" IS NULL`);
    await queryRunner.query(`UPDATE "targeting_rules" SET "comparison_value" = 'null'::jsonb WHERE "comparison_value" IS NULL`);
    await queryRunner.query(`ALTER TABLE "targeting_rules" ALTER COLUMN "comparison_value" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "targeting_rules" ALTER COLUMN "operator" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "targeting_rules" ALTER COLUMN "attribute" SET NOT NULL`);
    await queryRunner.query(`DROP INDEX "public"."IDX_targeting_rules_segment_id"`);
    await queryRunner.query(`ALTER TABLE "targeting_rules" DROP CONSTRAINT "FK_targeting_rules_segment"`);
    await queryRunner.query(`ALTER TABLE "targeting_rules" DROP COLUMN "segment_id"`);
    await queryRunner.query(`ALTER TABLE "targeting_rules" DROP COLUMN "source"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_segment_conditions_segment_order"`);
    await queryRunner.query(`DROP TABLE "segment_conditions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_segments_project_id"`);
    await queryRunner.query(`DROP TABLE "segments"`);
    await queryRunner.query(`DROP TYPE "public"."targeting_rules_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."segments_match_mode_enum"`);
  }
}
