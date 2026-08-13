import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AnalyticsService } from "./analytics.service";
import type { AnalyticsOverviewResponse } from "./dto/analytics-overview-response.dto";
import { analyticsRangeValues, ListAnalyticsOverviewDto } from "./dto/list-analytics-overview.dto";

@ApiTags("analytics")
@ApiBearerAuth("access-token")
@Controller("projects/:projectId/analytics")
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({
    summary:
      "Get an evaluation analytics overview for the project (totals, top flags, time buckets, reason breakdown), optionally filtered by environment, flag key, and time range"
  })
  @ApiQuery({ name: "environmentId", required: false, description: "Restrict results to a single environment", type: String })
  @ApiQuery({ name: "flagKey", required: false, description: "Restrict results to a single flag key", type: String })
  @ApiQuery({
    name: "range",
    required: false,
    description: "Time window to aggregate over (defaults to the service's default range)",
    enum: analyticsRangeValues
  })
  @ApiResponse({
    status: 200,
    description: "Evaluation counts, top flags, time-bucketed trends, and reason breakdown for the project over the requested filters"
  })
  @Get("overview")
  getOverview(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Query() filters: ListAnalyticsOverviewDto
  ): Promise<AnalyticsOverviewResponse> {
    return this.analyticsService.getProjectOverview(user, projectId, filters);
  }
}
