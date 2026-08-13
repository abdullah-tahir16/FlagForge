import { useQuery } from "@tanstack/react-query";
import type { AuditLogFilters } from "../../../core/types/Audit";
import { getAccessToken } from "../../api/Auth/session";
import { getAuditLogs } from "../../api/Audit";

export const auditLogsQueryKey = (filters: AuditLogFilters) => ["audit-logs", filters];

export const useAuditLogs = (filters: AuditLogFilters) =>
  useQuery({
    enabled: Boolean(getAccessToken()),
    queryFn: () => getAuditLogs(filters),
    queryKey: auditLogsQueryKey(filters),
    retry: false
  });
