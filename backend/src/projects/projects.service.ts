import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import type { AuditContext, AuditSnapshot } from "../audit/audit-context";
import { AuditAction } from "../audit/audit-action.enum";
import { AuditResourceType } from "../audit/audit-resource-type.enum";
import { AuditService } from "../audit/audit.service";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { createKeyFromName } from "../common/fns/create-key-from-name";
import { Environment } from "../environments/environment.entity";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectResponse } from "./dto/project-response.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { Project } from "./project.entity";

export const defaultEnvironments = [
  { key: "development", name: "Development", sortOrder: 10 },
  { key: "staging", name: "Staging", sortOrder: 20 },
  { key: "production", name: "Production", sortOrder: 30 }
] as const;

@Injectable()
export class ProjectsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>
  ) {}

  async create(user: AuthenticatedUser, dto: CreateProjectDto, auditContext?: AuditContext): Promise<ProjectResponse> {
    const name = dto.name.trim();
    const key = createKeyFromName(name);

    if (!key) {
      throw new ConflictException("Project key could not be generated");
    }

    const existingProject = await this.projectsRepository.findOne({ where: { organizationId: user.organizationId, key } });

    if (existingProject) {
      throw new ConflictException("A project with this key already exists");
    }

    const project = await this.dataSource.transaction(async (manager) => {
      const projectRepository = manager.getRepository(Project);
      const environmentRepository = manager.getRepository(Environment);
      const savedProject = await projectRepository.save(
        projectRepository.create({
          description: this.normalizeDescription(dto.description),
          key,
          name,
          organizationId: user.organizationId
        })
      );

      await environmentRepository.save(
        defaultEnvironments.map((environment) =>
          environmentRepository.create({
            ...environment,
            projectId: savedProject.id
          })
        )
      );

      return savedProject;
    });

    await this.auditService.record(
      user,
      {
        action: AuditAction.ProjectCreated,
        newValue: this.projectSnapshot(project),
        oldValue: null,
        projectId: project.id,
        resourceId: project.id,
        resourceName: project.name,
        resourceType: AuditResourceType.Project
      },
      auditContext
    );

    return this.toResponse(project);
  }

  async findAll(user: AuthenticatedUser): Promise<ProjectResponse[]> {
    const projects = await this.projectsRepository.find({
      where: { organizationId: user.organizationId },
      order: { createdAt: "DESC" }
    });

    return projects.map((project) => this.toResponse(project));
  }

  async findOne(user: AuthenticatedUser, projectId: string): Promise<ProjectResponse> {
    const project = await this.findProjectForUser(user, projectId);

    return this.toResponse(project);
  }

  async update(
    user: AuthenticatedUser,
    projectId: string,
    dto: UpdateProjectDto,
    auditContext?: AuditContext
  ): Promise<ProjectResponse> {
    const project = await this.findProjectForUser(user, projectId);
    const oldValue = this.changedProjectSnapshot(project, dto);

    if (dto.name !== undefined) {
      project.name = dto.name.trim();
    }

    if (dto.description !== undefined) {
      project.description = this.normalizeDescription(dto.description);
    }

    const savedProject = await this.projectsRepository.save(project);
    await this.auditService.record(
      user,
      {
        action: AuditAction.ProjectUpdated,
        newValue: this.changedProjectSnapshot(savedProject, dto),
        oldValue,
        projectId: savedProject.id,
        resourceId: savedProject.id,
        resourceName: savedProject.name,
        resourceType: AuditResourceType.Project
      },
      auditContext
    );

    return this.toResponse(savedProject);
  }

  async remove(user: AuthenticatedUser, projectId: string, auditContext?: AuditContext): Promise<void> {
    const project = await this.findProjectForUser(user, projectId);
    await this.projectsRepository.remove(project);
    await this.auditService.record(
      user,
      {
        action: AuditAction.ProjectDeleted,
        newValue: null,
        oldValue: this.projectSnapshot(project),
        projectId: project.id,
        resourceId: project.id,
        resourceName: project.name,
        resourceType: AuditResourceType.Project
      },
      auditContext
    );
  }

  async findProjectForUser(user: AuthenticatedUser, projectId: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId, organizationId: user.organizationId }
    });

    if (!project) {
      throw new NotFoundException("Project was not found");
    }

    return project;
  }

  toResponse(project: Project): ProjectResponse {
    return {
      createdAt: project.createdAt,
      description: project.description,
      id: project.id,
      key: project.key,
      name: project.name,
      organizationId: project.organizationId,
      updatedAt: project.updatedAt
    };
  }

  private normalizeDescription(description: string | null | undefined): string | null {
    if (description === null || description === undefined) {
      return null;
    }

    const trimmedDescription = description.trim();

    return trimmedDescription ? trimmedDescription : null;
  }

  private changedProjectSnapshot(project: Project, dto: UpdateProjectDto): AuditSnapshot {
    const snapshot: AuditSnapshot = {};

    if (dto.name !== undefined) {
      snapshot.name = project.name;
    }

    if (dto.description !== undefined) {
      snapshot.description = project.description;
    }

    return snapshot;
  }

  private projectSnapshot(project: Project): AuditSnapshot {
    return {
      description: project.description,
      key: project.key,
      name: project.name,
      organizationId: project.organizationId
    };
  }
}
