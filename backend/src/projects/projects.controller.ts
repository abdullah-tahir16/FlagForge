import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { getAuditContextFromRequest } from "../audit/audit-context";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectResponse } from "./dto/project-response.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectsService } from "./projects.service";

@Controller("projects")
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProjectDto,
    @Req() request: Request
  ): Promise<ProjectResponse> {
    return this.projectsService.create(user, dto, getAuditContextFromRequest(request));
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<ProjectResponse[]> {
    return this.projectsService.findAll(user);
  }

  @Get(":projectId")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("projectId") projectId: string): Promise<ProjectResponse> {
    return this.projectsService.findOne(user, projectId);
  }

  @Patch(":projectId")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Body() dto: UpdateProjectDto,
    @Req() request: Request
  ): Promise<ProjectResponse> {
    return this.projectsService.update(user, projectId, dto, getAuditContextFromRequest(request));
  }

  @Delete(":projectId")
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Req() request: Request
  ): Promise<void> {
    return this.projectsService.remove(user, projectId, getAuditContextFromRequest(request));
  }
}
