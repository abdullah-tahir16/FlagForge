import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Environment } from "../environments/environment.entity";
import { Project } from "../projects/project.entity";
import { AuditController } from "./audit.controller";
import { AuditLog } from "./audit-log.entity";
import { AuditService } from "./audit.service";

@Module({
  controllers: [AuditController],
  exports: [AuditService],
  imports: [TypeOrmModule.forFeature([AuditLog, Project, Environment])],
  providers: [AuditService]
})
export class AuditModule {}
