import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OrganizationResponse } from "./dto/organization-response.dto";
import { UpdateCurrentOrganizationDto } from "./dto/update-current-organization.dto";
import { OrganizationsService } from "./organizations.service";

@ApiTags("organizations")
@ApiBearerAuth("access-token")
@Controller("organizations")
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get("current")
  @ApiOperation({ summary: "Get the current user's organization" })
  @ApiResponse({ status: 200, description: "Organization details returned" })
  getCurrentOrganization(@CurrentUser() user: AuthenticatedUser): Promise<OrganizationResponse> {
    return this.organizationsService.getCurrentOrganization(user);
  }

  @Patch("current")
  @ApiOperation({ summary: "Rename the current user's organization (owners only)" })
  @ApiResponse({ status: 200, description: "Updated organization details returned" })
  updateCurrentOrganization(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCurrentOrganizationDto
  ): Promise<OrganizationResponse> {
    return this.organizationsService.updateCurrentOrganization(user, dto);
  }
}
