import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { databaseConfig } from "./common/database/database.config";
import { HealthModule } from "./common/health/health.module";
import { EnvironmentsModule } from "./environments/environments.module";
import { EvaluationsModule } from "./evaluations/evaluations.module";
import { FeatureFlagsModule } from "./feature-flags/feature-flags.module";
import { OrganizationsModule } from "./organizations/organizations.module";
import { ProjectsModule } from "./projects/projects.module";
import { SdkKeysModule } from "./sdk-keys/sdk-keys.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env", "../.env"],
      isGlobal: true
    }),
    CqrsModule,
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    ProjectsModule,
    EnvironmentsModule,
    FeatureFlagsModule,
    EvaluationsModule,
    SdkKeysModule,
    AuditModule
  ]
})
export class AppModule {}
