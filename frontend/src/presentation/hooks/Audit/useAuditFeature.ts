import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuditLogFilters } from "../../../core/types/Audit";
import { useCurrentOrganization } from "../../../infrastructure/hooks/Organization/useCurrentOrganization";
import { useAppUseCase } from "../../../infrastructure/useCases/App/useAppUseCase";
import { useAuditUseCase } from "../../../infrastructure/useCases/Audit/useAuditUseCase";
import { useAuthUseCase } from "../../../infrastructure/useCases/Auth/useAuthUseCase";
import { validateWithSchema } from "../Auth/fns";
import { auditFilterSchema } from "./data";
import { getAuditFilterValues, toAuditFilters } from "./fns";

const auditPageLimit = 25;

export const useAuditFeature = () => {
  const app = useAppUseCase();
  const auth = useAuthUseCase();
  const currentOrganizationQuery = useCurrentOrganization();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AuditLogFilters>({ limit: auditPageLimit });
  const [previousCursors, setPreviousCursors] = useState<string[]>([]);
  const audit = useAuditUseCase(filters);

  const filterInitialValues = useMemo(() => getAuditFilterValues(filters), [filters]);

  const onApplyFilters = async (values: Record<string, string>) => {
    const parsedValues = auditFilterSchema.parse(values);
    setPreviousCursors([]);
    setFilters({
      ...toAuditFilters(parsedValues),
      limit: auditPageLimit
    });
  };

  const onClearFilters = () => {
    setPreviousCursors([]);
    setFilters({ limit: auditPageLimit });
  };

  const onNextPage = () => {
    if (!audit.nextCursor) {
      return;
    }

    setPreviousCursors((cursors) => [...cursors, filters.cursor ?? ""]);
    setFilters((currentFilters) => ({ ...currentFilters, cursor: audit.nextCursor ?? undefined }));
  };

  const onPreviousPage = () => {
    setPreviousCursors((cursors) => {
      const nextCursors = [...cursors];
      const previousCursor = nextCursors.pop();
      setFilters((currentFilters) => ({ ...currentFilters, cursor: previousCursor || undefined }));
      return nextCursors;
    });
  };

  const onLogout = async () => {
    await auth.logout();
    navigate("/login");
  };

  return {
    auditErrorMessage: audit.auditLogsError ? "Audit logs could not be loaded." : null,
    auditLogs: audit.auditLogs,
    canGoNext: Boolean(audit.nextCursor),
    canGoPrevious: previousCursors.length > 0,
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
    title: "Audit",
    validateFilters: validateWithSchema(auditFilterSchema),
    ...app
  };
};
