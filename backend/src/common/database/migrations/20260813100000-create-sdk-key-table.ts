import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSdkKeyTable20260813100000 implements MigrationInterface {
  name = "CreateSdkKeyTable20260813100000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "sdk_keys" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "environment_id" uuid NOT NULL,
        "name" character varying(120) NOT NULL,
        "key_hash" character varying(64) NOT NULL,
        "key_prefix" character varying(32) NOT NULL,
        "last_used_at" TIMESTAMP,
        "revoked_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sdk_keys_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_sdk_keys_key_hash" UNIQUE ("key_hash"),
        CONSTRAINT "FK_sdk_keys_environment" FOREIGN KEY ("environment_id") REFERENCES "environments"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_sdk_keys_environment_id" ON "sdk_keys" ("environment_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_sdk_keys_environment_id"`);
    await queryRunner.query(`DROP TABLE "sdk_keys"`);
  }
}
