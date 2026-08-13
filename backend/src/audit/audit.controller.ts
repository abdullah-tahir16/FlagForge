import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuditService } from "./audit.service";
import type { AuditLogListResponse } from "./dto/audit-log-response.dto";
import { ListAuditLogsDto } from "./dto/list-audit-logs.dto";

@ApiTags("audit")
@ApiBearerAuth("access-token")
@Controller("audit")
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({
    summary: "List organization-scoped audit log entries with optional filters and cursor-based pagination",
  })
  @ApiQuery({ name: "projectId", required: false, description: "Filter by project id" })
  @ApiQuery({ name: "environmentId", required: false, description: "Filter by environment id" })
  @ApiQuery({ name: "resourceType", required: false, description: "Filter by resource type" })
  @ApiQuery({ name: "action", required: false, description: "Filter by audit action" })
  @ApiQuery({ name: "cursor", required: false, description: "Opaque cursor for pagination" })
  @ApiQuery({ name: "limit", required: false, description: "Maximum number of entries to return (1-100)" })
  @ApiResponse({
    status: 200,
    description: "A cursor-paginated list of audit log entries matching the provided filters",
  })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() filters: ListAuditLogsDto): Promise<AuditLogListResponse> {
    return this.auditService.findAll(user, filters);
  }
}
