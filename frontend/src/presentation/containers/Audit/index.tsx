import AppShell from "../../components/AppShell";
import Audit from "../../components/Audit";
import PageHeader from "../../components/Common/PageHeader";
import { useAuditFeature } from "../../hooks/Audit/useAuditFeature";

interface Props {}

const AuditContainer = (_props: Props) => {
  const feature = useAuditFeature();

  return (
    <AppShell
      apiStatus={feature.apiStatus}
      isCheckingApi={feature.isCheckingApi}
      onLogout={feature.onLogout}
      organizationName={feature.currentOrganization?.name ?? "Dashboard"}
      userName={feature.currentUser ? `${feature.currentUser.firstName} ${feature.currentUser.lastName}` : "User"}
    >
      <PageHeader
        description="Review organization changes across projects, environments, flags, and SDK keys."
        title={feature.title}
      />
      <Audit
        auditErrorMessage={feature.auditErrorMessage}
        auditLogs={feature.auditLogs}
        canGoNext={feature.canGoNext}
        canGoPrevious={feature.canGoPrevious}
        filterInitialValues={feature.filterInitialValues}
        isLoadingAuditLogs={feature.isLoadingAuditLogs}
        isRefetchingAuditLogs={feature.isRefetchingAuditLogs}
        onApplyFilters={feature.onApplyFilters}
        onClearFilters={feature.onClearFilters}
        onNextPage={feature.onNextPage}
        onPreviousPage={feature.onPreviousPage}
        pageNumber={feature.pageNumber}
        pagination={feature.pagination}
        validateFilters={feature.validateFilters}
      />
    </AppShell>
  );
};

export default AuditContainer;
