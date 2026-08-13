import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AnalyticsService } from "./analytics.service";
import type { AnalyticsOverviewResponse } from "./dto/analytics-overview-response.dto";
import { ListAnalyticsOverviewDto } from "./dto/list-analytics-overview.dto";

@Controller("projects/:projectId/analytics")
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("overview")
  getOverview(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Query() filters: ListAnalyticsOverviewDto
  ): Promise<AnalyticsOverviewResponse> {
    return this.analyticsService.getProjectOverview(user, projectId, filters);
  }
}
