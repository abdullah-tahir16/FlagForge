import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuditLogFilters } from "../../../core/types/Audit";
import { useCurrentOrganization } from "../../../infrastructure/hooks/Organization/useCurrentOrganization";
import { useAppUseCase } from "../../../infrastructure/useCases/App/useAppUseCase";
import { useAuditUseCase } from "../../../infrastructure/useCases/Audit/useAuditUseCase";
import { useAuthUseCase } from "../../../infrastructure/useCases/Auth/useAuthUseCase";
import { validateWithSchema } from "../Auth/fns";
import { useCursorPagination } from "../Common/useCursorPagination";
import { auditFilterSchema } from "./data";
import { getAuditFilterValues, toAuditFilters } from "./fns";

const auditPageLimit = 25;

export const useAuditFeature = () => {
  const app = useAppUseCase();
  const auth = useAuthUseCase();
  const currentOrganizationQuery = useCurrentOrganization();
  const navigate = useNavigate();
  const pagination = useCursorPagination();
  const [activeFilters, setActiveFilters] = useState<Omit<AuditLogFilters, "cursor" | "limit">>({});
  const filters = useMemo<AuditLogFilters>(
    () => ({
      ...activeFilters,
      cursor: pagination.cursor,
      limit: auditPageLimit
    }),
    [activeFilters, pagination.cursor]
  );
  const audit = useAuditUseCase(filters);

  const filterInitialValues = useMemo(() => getAuditFilterValues(activeFilters), [activeFilters]);

  const onApplyFilters = async (values: Record<string, string>) => {
    const parsedValues = auditFilterSchema.parse(values);
    pagination.resetPagination();
    setActiveFilters(toAuditFilters(parsedValues));
  };

  const onClearFilters = () => {
    pagination.resetPagination();
    setActiveFilters({});
  };

  const onNextPage = () => {
    pagination.goToNextPage(audit.pagination);
  };

  const onPreviousPage = () => {
    pagination.goToPreviousPage();
  };

  const onLogout = async () => {
    await auth.logout();
    navigate("/login");
  };

  return {
    auditErrorMessage: audit.auditLogsError ? "Audit logs could not be loaded." : null,
    auditLogs: audit.auditLogs,
    canGoNext: audit.pagination.hasNextPage,
    canGoPrevious: pagination.canGoPrevious,
    currentOrganization: currentOrganizationQuery.data,
    currentUser: auth.currentUser,
    filterInitialValues,
    isLoadingAuditLogs: audit.isLoadingAuditLogs,
    isRefetchingAuditLogs: audit.isRefetchingAuditLogs,
    onApplyFilters,
    onClearFilters,
    onLogout,
    onNextPage,
    onPreviousPage,
    pageNumber: pagination.pageNumber,
    pagination: audit.pagination,
    title: "Audit",
    validateFilters: validateWithSchema(auditFilterSchema),
    ...app
  };
};
