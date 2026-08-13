import type { AuditLogFilters } from "../../../core/types/Audit";
import { useAuditLogs } from "../../hooks/Audit/useAuditLogs";

export const useAuditUseCase = (filters: AuditLogFilters) => {
  const auditLogsQuery = useAuditLogs(filters);

  return {
    auditLogs: auditLogsQuery.data?.entries ?? [],
    auditLogsError: auditLogsQuery.error,
    isLoadingAuditLogs: auditLogsQuery.isLoading,
    isRefetchingAuditLogs: auditLogsQuery.isFetching && !auditLogsQuery.isLoading,
    nextCursor: auditLogsQuery.data?.nextCursor ?? null
  };
};
