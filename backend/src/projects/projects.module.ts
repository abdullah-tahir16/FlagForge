import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Environment } from "../environments/environment.entity";
import { Project } from "./project.entity";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";

@Module({
  controllers: [ProjectsController],
  exports: [ProjectsService],
  imports: [TypeOrmModule.forFeature([Project, Environment])],
  providers: [ProjectsService]
})
export class ProjectsModule {}
