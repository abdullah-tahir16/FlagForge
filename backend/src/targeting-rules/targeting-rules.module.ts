import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditModule } from "../audit/audit.module";
import { Environment } from "../environments/environment.entity";
import { EnvironmentFlagConfig } from "../feature-flags/environment-flag-config.entity";
import { FeatureFlag } from "../feature-flags/feature-flag.entity";
import { ProjectsModule } from "../projects/projects.module";
import { TargetingRule } from "./targeting-rule.entity";
import { TargetingRulesController } from "./targeting-rules.controller";
import { targetingRuleHandlers } from "./targeting-rules.handlers";
import { TargetingRulesService } from "./targeting-rules.service";

@Module({
  controllers: [TargetingRulesController],
  exports: [TargetingRulesService],
  imports: [
    AuditModule,
    CqrsModule,
    ProjectsModule,
    TypeOrmModule.forFeature([Environment, EnvironmentFlagConfig, FeatureFlag, TargetingRule])
  ],
  providers: [TargetingRulesService, ...targetingRuleHandlers]
})
export class TargetingRulesModule {}
