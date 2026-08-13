import type { AuditLogFilters } from "../../../core/types/Audit";
import { useAuditLogs } from "../../hooks/Audit/useAuditLogs";

export const useAuditUseCase = (filters: AuditLogFilters) => {
  const auditLogsQuery = useAuditLogs(filters);

  return {
    auditLogs: auditLogsQuery.data?.entries ?? [],
    auditLogsError: auditLogsQuery.error,
    isLoadingAuditLogs: auditLogsQuery.isLoading,
    isRefetchingAuditLogs: auditLogsQuery.isFetching && !auditLogsQuery.isLoading,
    pagination: auditLogsQuery.data?.pagination ?? {
      hasNextPage: false,
      limit: filters.limit ?? 25,
      nextCursor: null
    }
  };
};
