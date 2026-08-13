import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjectEnvironmentTables20260813082000 implements MigrationInterface {
  name = "CreateProjectEnvironmentTables20260813082000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "organization_id" uuid NOT NULL,
        "name" character varying(160) NOT NULL,
        "key" character varying(120) NOT NULL,
        "description" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_projects_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_projects_organization_key" UNIQUE ("organization_id", "key"),
        CONSTRAINT "FK_projects_organization" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_projects_organization_id" ON "projects" ("organization_id")`);
    await queryRunner.query(`
      CREATE TABLE "environments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "project_id" uuid NOT NULL,
        "name" character varying(120) NOT NULL,
        "key" character varying(80) NOT NULL,
        "sort_order" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_environments_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_environments_project_key" UNIQUE ("project_id", "key"),
        CONSTRAINT "FK_environments_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_environments_project_sort_order" ON "environments" ("project_id", "sort_order")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_environments_project_sort_order"`);
    await queryRunner.query(`DROP TABLE "environments"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_projects_organization_id"`);
    await queryRunner.query(`DROP TABLE "projects"`);
  }
}
