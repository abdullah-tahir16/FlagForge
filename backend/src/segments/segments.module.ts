import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditModule } from "../audit/audit.module";
import { ProjectsModule } from "../projects/projects.module";
import { TargetingRule } from "../targeting-rules/targeting-rule.entity";
import { SegmentCondition } from "./segment-condition.entity";
import { Segment } from "./segment.entity";
import { segmentHandlers } from "./segments.handlers";
import { SegmentsController } from "./segments.controller";
import { SegmentsService } from "./segments.service";

@Module({
  controllers: [SegmentsController],
  exports: [SegmentsService],
  imports: [AuditModule, CqrsModule, ProjectsModule, TypeOrmModule.forFeature([Segment, SegmentCondition, TargetingRule])],
  providers: [SegmentsService, ...segmentHandlers]
})
export class SegmentsModule {}
