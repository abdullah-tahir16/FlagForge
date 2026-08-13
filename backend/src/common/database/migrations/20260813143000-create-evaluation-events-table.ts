import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEvaluationEventsTable20260813143000 implements MigrationInterface {
  name = "CreateEvaluationEventsTable20260813143000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."evaluation_events_evaluation_type_enum" AS ENUM ('SINGLE', 'ALL')
    `);
    await queryRunner.query(`
      CREATE TABLE "evaluation_events" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "organization_id" uuid NOT NULL,
        "project_id" uuid NOT NULL,
        "environment_id" uuid NOT NULL,
        "sdk_key_id" uuid NOT NULL,
        "flag_key" character varying(120) NOT NULL,
        "value" boolean NOT NULL,
        "reason" character varying(80) NOT NULL,
        "evaluation_type" "public"."evaluation_events_evaluation_type_enum" NOT NULL,
        "occurred_at" TIMESTAMP NOT NULL,
        CONSTRAINT "PK_evaluation_events_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_evaluation_events_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_evaluation_events_environment" FOREIGN KEY ("environment_id") REFERENCES "environments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_evaluation_events_sdk_key" FOREIGN KEY ("sdk_key_id") REFERENCES "sdk_keys"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_evaluation_events_project_occurred_at" ON "evaluation_events" ("project_id", "occurred_at")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_evaluation_events_environment_occurred_at" ON "evaluation_events" ("environment_id", "occurred_at")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_evaluation_events_project_flag_occurred_at" ON "evaluation_events" ("project_id", "flag_key", "occurred_at")`
    );
    await queryRunner.query(`CREATE INDEX "IDX_evaluation_events_sdk_key_id" ON "evaluation_events" ("sdk_key_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_evaluation_events_sdk_key_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_evaluation_events_project_flag_occurred_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_evaluation_events_environment_occurred_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_evaluation_events_project_occurred_at"`);
    await queryRunner.query(`DROP TABLE "evaluation_events"`);
    await queryRunner.query(`DROP TYPE "public"."evaluation_events_evaluation_type_enum"`);
  }
}
