import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { ProjectsService } from "../projects/projects.service";
import { EnvironmentResponse } from "./dto/environment-response.dto";
import { UpdateEnvironmentDto } from "./dto/update-environment.dto";
import { Environment } from "./environment.entity";

@Injectable()
export class EnvironmentsService {
  constructor(
    private readonly projectsService: ProjectsService,
    @InjectRepository(Environment)
    private readonly environmentsRepository: Repository<Environment>
  ) {}

  async findAll(user: AuthenticatedUser, projectId: string): Promise<EnvironmentResponse[]> {
    await this.projectsService.findProjectForUser(user, projectId);
    const environments = await this.environmentsRepository.find({
      where: { projectId },
      order: { sortOrder: "ASC" }
    });

    return environments.map((environment) => this.toResponse(environment));
  }

  async update(
    user: AuthenticatedUser,
    projectId: string,
    environmentId: string,
    dto: UpdateEnvironmentDto
  ): Promise<EnvironmentResponse> {
    await this.projectsService.findProjectForUser(user, projectId);
    const environment = await this.environmentsRepository.findOne({ where: { id: environmentId, projectId } });

    if (!environment) {
      throw new NotFoundException("Environment was not found");
    }

    if (dto.name !== undefined) {
      environment.name = dto.name.trim();
    }

    const savedEnvironment = await this.environmentsRepository.save(environment);

    return this.toResponse(savedEnvironment);
  }

  toResponse(environment: Environment): EnvironmentResponse {
    return {
      createdAt: environment.createdAt,
      id: environment.id,
      key: environment.key,
      name: environment.name,
      projectId: environment.projectId,
      sortOrder: environment.sortOrder,
      updatedAt: environment.updatedAt
    };
  }
}
