import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { UserRole } from "../users/user-role.enum";
import { OrganizationResponse } from "./dto/organization-response.dto";
import { UpdateCurrentOrganizationDto } from "./dto/update-current-organization.dto";
import { Organization } from "./organization.entity";

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>
  ) {}

  async getCurrentOrganization(user: AuthenticatedUser): Promise<OrganizationResponse> {
    const organization = await this.organizationsRepository.findOne({ where: { id: user.organizationId } });

    if (!organization) {
      throw new NotFoundException("Organization was not found");
    }

    return this.toResponse(organization);
  }

  async updateCurrentOrganization(
    user: AuthenticatedUser,
    dto: UpdateCurrentOrganizationDto
  ): Promise<OrganizationResponse> {
    if (user.role !== UserRole.Owner) {
      throw new ForbiddenException("Only organization owners can update the organization");
    }

    const organization = await this.organizationsRepository.findOne({ where: { id: user.organizationId } });

    if (!organization) {
      throw new NotFoundException("Organization was not found");
    }

    organization.name = dto.name.trim();
    const savedOrganization = await this.organizationsRepository.save(organization);

    return this.toResponse(savedOrganization);
  }

  private toResponse(organization: Organization): OrganizationResponse {
    return {
      id: organization.id,
      name: organization.name,
      key: organization.key,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt
    };
  }
}
