import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Segment, SegmentCondition } from "../../../core/types/Segment";
import { useCurrentOrganization } from "../../../infrastructure/hooks/Organization/useCurrentOrganization";
import { useAppUseCase } from "../../../infrastructure/useCases/App/useAppUseCase";
import { useAuthUseCase } from "../../../infrastructure/useCases/Auth/useAuthUseCase";
import { useProjectUseCase } from "../../../infrastructure/useCases/Project/useProjectUseCase";
import { useSegmentUseCase } from "../../../infrastructure/useCases/Segment/useSegmentUseCase";
import { validateWithSchema } from "../Auth/fns";
import { useCursorPagination } from "../Common/useCursorPagination";
import { segmentConditionFormSchema, segmentFormSchema } from "./data";
import {
  defaultSegmentFormValues,
  getSegmentConditionInitialValues,
  getSegmentInitialValues,
  moveSegmentCondition,
  parseSegmentConditionFormValues,
  parseSegmentFormValues
} from "./fns";

export const useSegmentsFeature = () => {
  const app = useAppUseCase();
  const auth = useAuthUseCase();
  const currentOrganizationQuery = useCurrentOrganization();
  const navigate = useNavigate();
  const { projectId, segmentId } = useParams<{ projectId: string; segmentId: string }>();
  const pagination = useCursorPagination();
  const projects = useProjectUseCase(projectId);
  const segments = useSegmentUseCase(projectId, pagination.cursor, segmentId);
  const [pendingDeleteSegment, setPendingDeleteSegment] = useState<Segment | null>(null);
  const [pendingDeleteCondition, setPendingDeleteCondition] = useState<SegmentCondition | null>(null);
  const [editingCondition, setEditingCondition] = useState<SegmentCondition | undefined>();

  const onLogout = async () => {
    await auth.logout();
    navigate("/login");
  };

  const onCreateSegmentSubmit = async (values: Record<string, string>) => {
    if (!projectId) {
      return;
    }

    const segment = await segments.createSegment(parseSegmentFormValues(segmentFormSchema.parse(values)));
    navigate(`/projects/${projectId}/segments/${segment.id}`);
  };

  const onSegmentSubmit = async (values: Record<string, string>) => {
    if (!projectId || !segmentId) {
      return;
    }

    await segments.updateSegment(parseSegmentFormValues(segmentFormSchema.parse(values)));
  };

  const onRequestDeleteSegment = (segment: Segment) => {
    setPendingDeleteSegment(segment);
  };

  const onCancelDeleteSegment = () => {
    setPendingDeleteSegment(null);
  };

  const onConfirmDeleteSegment = async () => {
    if (!pendingDeleteSegment) {
      return;
    }

    await segments.deleteSegment(pendingDeleteSegment.id);
    setPendingDeleteSegment(null);
  };

  const onConditionSubmit = async (values: Record<string, string>) => {
    if (!projectId || !segmentId) {
      return;
    }

    const parsedValues = parseSegmentConditionFormValues(segmentConditionFormSchema.parse(values));

    if (editingCondition) {
      await segments.updateCondition(editingCondition.id, parsedValues);
      setEditingCondition(undefined);
      return;
    }

    await segments.createCondition(parsedValues);
  };

  const onMoveCondition = async (conditionId: string, direction: "down" | "up") => {
    if (!segments.segment) {
      return;
    }

    await segments.reorderConditions(moveSegmentCondition(segments.segment.conditions, conditionId, direction));
  };

  const onRequestEditCondition = (condition: SegmentCondition) => {
    setEditingCondition(condition);
  };

  const onCancelEditCondition = () => {
    setEditingCondition(undefined);
  };

  const onRequestDeleteCondition = (condition: SegmentCondition) => {
    setPendingDeleteCondition(condition);
  };

  const onCancelDeleteCondition = () => {
    setPendingDeleteCondition(null);
  };

  const onConfirmDeleteCondition = async () => {
    if (!pendingDeleteCondition) {
      return;
    }

    await segments.deleteCondition(pendingDeleteCondition.id);
    setPendingDeleteCondition(null);
  };

  return {
    canGoNext: segments.pagination.hasNextPage,
    canGoPrevious: pagination.canGoPrevious,
    conditionErrorMessage: segments.conditionMutationError ? "Segment condition could not be saved." : null,
    conditionInitialValues: getSegmentConditionInitialValues(editingCondition),
    createSegmentErrorMessage: segments.createSegmentError ? "Segment could not be created." : null,
    createSegmentInitialValues: defaultSegmentFormValues,
    currentOrganization: currentOrganizationQuery.data,
    currentUser: auth.currentUser,
    deleteSegmentErrorMessage: segments.deleteSegmentError ? "Segment could not be deleted while it is referenced." : null,
    deletingConditionId: segments.deletingConditionId,
    deletingSegmentId: segments.deletingSegmentId,
    editingCondition,
    isConditionDeleteDialogOpen: Boolean(pendingDeleteCondition),
    isCreatingCondition: segments.isCreatingCondition,
    isCreatingSegment: segments.isCreatingSegment,
    isDeletingCondition: segments.isDeletingCondition,
    isDeletingSegment: segments.isDeletingSegment,
    isLoadingProject: projects.isLoadingProject,
    isLoadingProjects: projects.isLoadingProjects,
    isLoadingSegment: segments.isLoadingSegment,
    isLoadingSegments: segments.isLoadingSegments,
    isReorderingConditions: segments.isReorderingConditions,
    isUpdatingCondition: segments.isUpdatingCondition,
    isUpdatingSegment: segments.isUpdatingSegment,
    onCancelDeleteCondition,
    onCancelDeleteSegment,
    onCancelEditCondition,
    onConditionSubmit,
    onConfirmDeleteCondition,
    onConfirmDeleteSegment,
    onCreateSegmentSubmit,
    onLogout,
    onMoveCondition,
    onNextPage: () => pagination.goToNextPage(segments.pagination),
    onPreviousPage: pagination.goToPreviousPage,
    onRequestDeleteCondition,
    onRequestDeleteSegment,
    onRequestEditCondition,
    onSegmentSubmit,
    pageLabel: `Page ${pagination.pageNumber}`,
    pendingDeleteCondition,
    pendingDeleteSegment,
    project: projects.project,
    projectErrorMessage: projects.projectError ? "Project could not be loaded." : null,
    projects: projects.projects,
    projectsErrorMessage: projects.projectsError ? "Projects could not be loaded." : null,
    segment: segments.segment,
    segmentErrorMessage: segments.segmentError ? "Segment could not be loaded." : null,
    segmentInitialValues: getSegmentInitialValues(segments.segment),
    segments: segments.segments,
    segmentsErrorMessage: segments.segmentsError ? "Segments could not be loaded." : null,
    title: segmentId
      ? (segments.segment?.name ?? "Segment")
      : projectId
        ? `${projects.project?.name ?? "Project"} segments`
        : "Segments",
    updateSegmentErrorMessage: segments.updateSegmentError ? "Segment could not be updated." : null,
    validateCondition: validateWithSchema(segmentConditionFormSchema),
    validateSegment: validateWithSchema(segmentFormSchema),
    ...app
  };
};
