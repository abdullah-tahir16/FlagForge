import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { getAuditContextFromRequest } from "../audit/audit-context";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectResponse } from "./dto/project-response.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectsService } from "./projects.service";

@ApiTags("projects")
@ApiBearerAuth("access-token")
@Controller("projects")
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new project owned by the current user" })
  @ApiResponse({ status: 201, description: "The created project" })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProjectDto,
    @Req() request: Request
  ): Promise<ProjectResponse> {
    return this.projectsService.create(user, dto, getAuditContextFromRequest(request));
  }

  @Get()
  @ApiOperation({ summary: "List all projects accessible to the current user" })
  @ApiResponse({ status: 200, description: "The list of projects" })
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<ProjectResponse[]> {
    return this.projectsService.findAll(user);
  }

  @Get(":projectId")
  @ApiOperation({ summary: "Get a single project by ID" })
  @ApiResponse({ status: 200, description: "The requested project" })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("projectId") projectId: string): Promise<ProjectResponse> {
    return this.projectsService.findOne(user, projectId);
  }

  @Patch(":projectId")
  @ApiOperation({ summary: "Update a project's fields" })
  @ApiResponse({ status: 200, description: "The updated project" })
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
  @ApiOperation({ summary: "Delete a project" })
  @ApiResponse({ status: 204, description: "The project was deleted" })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Req() request: Request
  ): Promise<void> {
    return this.projectsService.remove(user, projectId, getAuditContextFromRequest(request));
  }
}
