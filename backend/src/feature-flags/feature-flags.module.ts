import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditModule } from "../audit/audit.module";
import { Environment } from "../environments/environment.entity";
import { ProjectsModule } from "../projects/projects.module";
import { EnvironmentFlagConfig } from "./environment-flag-config.entity";
import { FeatureFlag } from "./feature-flag.entity";
import { FeatureFlagsController } from "./feature-flags.controller";
import { FeatureFlagsService } from "./feature-flags.service";

@Module({
  controllers: [FeatureFlagsController],
  imports: [AuditModule, ProjectsModule, TypeOrmModule.forFeature([Environment, EnvironmentFlagConfig, FeatureFlag])],
  providers: [FeatureFlagsService]
})
export class FeatureFlagsModule {}
