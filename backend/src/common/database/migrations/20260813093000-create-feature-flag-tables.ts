import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFeatureFlagTables20260813093000 implements MigrationInterface {
  name = "CreateFeatureFlagTables20260813093000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "feature_flags" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "project_id" uuid NOT NULL,
        "name" character varying(160) NOT NULL,
        "key" character varying(120) NOT NULL,
        "type" character varying(24) NOT NULL,
        "description" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_feature_flags_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_feature_flags_project_key" UNIQUE ("project_id", "key"),
        CONSTRAINT "FK_feature_flags_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_feature_flags_project_id" ON "feature_flags" ("project_id")`);
    await queryRunner.query(`
      CREATE TABLE "environment_flag_configs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "feature_flag_id" uuid NOT NULL,
        "environment_id" uuid NOT NULL,
        "enabled" boolean NOT NULL DEFAULT false,
        "value" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_environment_flag_configs_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_environment_flag_configs_flag_environment" UNIQUE ("feature_flag_id", "environment_id"),
        CONSTRAINT "FK_environment_flag_configs_feature_flag" FOREIGN KEY ("feature_flag_id") REFERENCES "feature_flags"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_environment_flag_configs_environment" FOREIGN KEY ("environment_id") REFERENCES "environments"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_environment_flag_configs_environment_id" ON "environment_flag_configs" ("environment_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_environment_flag_configs_environment_id"`);
    await queryRunner.query(`DROP TABLE "environment_flag_configs"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_feature_flags_project_id"`);
    await queryRunner.query(`DROP TABLE "feature_flags"`);
  }
}
