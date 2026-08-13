import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EnvironmentFlagConfig } from "../feature-flags/environment-flag-config.entity";
import { FeatureFlag } from "../feature-flags/feature-flag.entity";
import { SdkKeysModule } from "../sdk-keys/sdk-keys.module";
import { TargetingRule } from "../targeting-rules/targeting-rule.entity";
import { EvaluationsController } from "./evaluations.controller";
import { EvaluationsService } from "./evaluations.service";
import { SdkAuthService } from "./sdk-auth.service";

@Module({
  controllers: [EvaluationsController],
  imports: [SdkKeysModule, TypeOrmModule.forFeature([EnvironmentFlagConfig, FeatureFlag, TargetingRule])],
  providers: [EvaluationsService, SdkAuthService]
})
export class EvaluationsModule {}
