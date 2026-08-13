import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRolloutPercentageToEnvironmentFlagConfigs20260813110500 implements MigrationInterface {
  name = "AddRolloutPercentageToEnvironmentFlagConfigs20260813110500";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "environment_flag_configs"
      ADD "rollout_percentage" integer NOT NULL DEFAULT 100
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "environment_flag_configs"
      DROP COLUMN "rollout_percentage"
    `);
  }
}
