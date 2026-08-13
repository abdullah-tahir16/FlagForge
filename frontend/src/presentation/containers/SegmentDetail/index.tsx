import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AppShell from "../../components/AppShell";
import Badge from "../../components/Common/Badge";
import PageHeader from "../../components/Common/PageHeader";
import SegmentDetail from "../../components/Segments/SegmentDetail";
import { useSegmentsFeature } from "../../hooks/Segments/useSegmentsFeature";

interface Props {}

const SegmentDetailContainer = (_props: Props) => {
  const feature = useSegmentsFeature();

  return (
    <AppShell
      apiStatus={feature.apiStatus}
      isCheckingApi={feature.isCheckingApi}
      onLogout={feature.onLogout}
      organizationName={feature.currentOrganization?.name ?? "Dashboard"}
      userName={feature.currentUser ? `${feature.currentUser.firstName} ${feature.currentUser.lastName}` : "User"}
    >
      <PageHeader
        description="Edit reusable segment metadata and ordered membership conditions."
        eyebrow={
          <Link
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-app-primary hover:text-app-primary-hover"
            to={`/projects/${feature.project?.id ?? ""}/segments`}
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Segments
          </Link>
        }
        metadata={feature.segment ? <Badge tone="primary">{feature.segment.key}</Badge> : null}
        title={feature.title}
      />
      <SegmentDetail
        conditionErrorMessage={feature.conditionErrorMessage}
        conditionInitialValues={feature.conditionInitialValues}
        deletingConditionId={feature.deletingConditionId}
        editingCondition={feature.editingCondition}
        isConditionDeleteDialogOpen={feature.isConditionDeleteDialogOpen}
        isCreatingCondition={feature.isCreatingCondition}
        isDeletingCondition={feature.isDeletingCondition}
        isLoadingProject={feature.isLoadingProject}
        isLoadingSegment={feature.isLoadingSegment}
        isReorderingConditions={feature.isReorderingConditions}
        isUpdatingCondition={feature.isUpdatingCondition}
        isUpdatingSegment={feature.isUpdatingSegment}
        onCancelDeleteCondition={feature.onCancelDeleteCondition}
        onCancelEditCondition={feature.onCancelEditCondition}
        onConditionSubmit={feature.onConditionSubmit}
        onConfirmDeleteCondition={feature.onConfirmDeleteCondition}
        onMoveCondition={feature.onMoveCondition}
        onRequestDeleteCondition={feature.onRequestDeleteCondition}
        onRequestEditCondition={feature.onRequestEditCondition}
        onSegmentSubmit={feature.onSegmentSubmit}
        pendingDeleteCondition={feature.pendingDeleteCondition}
        project={feature.project}
        projectErrorMessage={feature.projectErrorMessage}
        segment={feature.segment}
        segmentErrorMessage={feature.segmentErrorMessage}
        segmentInitialValues={feature.segmentInitialValues}
        updateSegmentErrorMessage={feature.updateSegmentErrorMessage}
        validateCondition={feature.validateCondition}
        validateSegment={feature.validateSegment}
      />
    </AppShell>
  );
};

export default SegmentDetailContainer;
