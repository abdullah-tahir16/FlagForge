import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OrganizationResponse } from "./dto/organization-response.dto";
import { UpdateCurrentOrganizationDto } from "./dto/update-current-organization.dto";
import { OrganizationsService } from "./organizations.service";

@Controller("organizations")
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get("current")
  getCurrentOrganization(@CurrentUser() user: AuthenticatedUser): Promise<OrganizationResponse> {
    return this.organizationsService.getCurrentOrganization(user);
  }

  @Patch("current")
  updateCurrentOrganization(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCurrentOrganizationDto
  ): Promise<OrganizationResponse> {
    return this.organizationsService.updateCurrentOrganization(user, dto);
  }
}
