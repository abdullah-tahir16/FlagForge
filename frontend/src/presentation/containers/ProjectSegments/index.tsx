import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AppShell from "../../components/AppShell";
import Badge from "../../components/Common/Badge";
import PageHeader from "../../components/Common/PageHeader";
import ProjectSegmentList from "../../components/Segments/ProjectSegmentList";
import { useSegmentsFeature } from "../../hooks/Segments/useSegmentsFeature";

interface Props {}

const ProjectSegmentsContainer = (_props: Props) => {
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
        description="Create reusable project segments and open each segment to manage membership conditions."
        eyebrow={
          <Link className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-app-primary hover:text-app-primary-hover" to="/segments">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Segments
          </Link>
        }
        metadata={feature.project ? <Badge tone="primary">{feature.project.key}</Badge> : null}
        title={feature.title}
      />
      <ProjectSegmentList
        canGoNext={feature.canGoNext}
        canGoPrevious={feature.canGoPrevious}
        createErrorMessage={feature.createSegmentErrorMessage}
        createInitialValues={feature.createSegmentInitialValues}
        deleteErrorMessage={feature.deleteSegmentErrorMessage}
        deletingSegmentId={feature.deletingSegmentId}
        isCreatingSegment={feature.isCreatingSegment}
        isDeletingSegment={feature.isDeletingSegment}
        isLoadingProject={feature.isLoadingProject}
        isLoadingSegments={feature.isLoadingSegments}
        onCancelDeleteSegment={feature.onCancelDeleteSegment}
        onConfirmDeleteSegment={feature.onConfirmDeleteSegment}
        onCreateSegmentSubmit={feature.onCreateSegmentSubmit}
        onNextPage={feature.onNextPage}
        onPreviousPage={feature.onPreviousPage}
        onRequestDeleteSegment={feature.onRequestDeleteSegment}
        pageLabel={feature.pageLabel}
        pendingDeleteSegment={feature.pendingDeleteSegment}
        project={feature.project}
        projectErrorMessage={feature.projectErrorMessage}
        segments={feature.segments}
        segmentsErrorMessage={feature.segmentsErrorMessage}
        validateSegment={feature.validateSegment}
      />
    </AppShell>
  );
};

export default ProjectSegmentsContainer;
