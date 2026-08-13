import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuditService } from "./audit.service";
import type { AuditLogListResponse } from "./dto/audit-log-response.dto";
import { ListAuditLogsDto } from "./dto/list-audit-logs.dto";

@Controller("audit")
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() filters: ListAuditLogsDto): Promise<AuditLogListResponse> {
    return this.auditService.findAll(user, filters);
  }
}
