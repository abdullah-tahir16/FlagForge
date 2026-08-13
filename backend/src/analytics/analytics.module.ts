import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProjectsModule } from "../projects/projects.module";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { EvaluationEvent } from "./evaluation-event.entity";

@Module({
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
  imports: [ProjectsModule, TypeOrmModule.forFeature([EvaluationEvent])],
  providers: [AnalyticsService]
})
export class AnalyticsModule {}
