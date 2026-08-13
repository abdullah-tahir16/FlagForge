import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditModule } from "../audit/audit.module";
import { Environment } from "../environments/environment.entity";
import { ProjectsModule } from "../projects/projects.module";
import { SdkKey } from "./sdk-key.entity";
import { SdkKeySecretService } from "./sdk-key-secret.service";
import { SdkKeysController } from "./sdk-keys.controller";
import { SdkKeysService } from "./sdk-keys.service";

@Module({
  controllers: [SdkKeysController],
  exports: [SdkKeySecretService, SdkKeysService],
  imports: [AuditModule, ProjectsModule, TypeOrmModule.forFeature([Environment, SdkKey])],
  providers: [SdkKeySecretService, SdkKeysService]
})
export class SdkKeysModule {}
