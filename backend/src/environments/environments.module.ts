import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Project } from "../projects/project.entity";
import { ProjectsModule } from "../projects/projects.module";
import { Environment } from "./environment.entity";
import { EnvironmentsController } from "./environments.controller";
import { EnvironmentsService } from "./environments.service";

@Module({
  controllers: [EnvironmentsController],
  imports: [ProjectsModule, TypeOrmModule.forFeature([Project, Environment])],
  providers: [EnvironmentsService]
})
export class EnvironmentsModule {}
