import type {
  CreateSegmentConditionInput,
  CreateSegmentInput,
  Segment,
  UpdateSegmentConditionInput,
  UpdateSegmentInput
} from "../../../core/types/Segment";
import { useCreateSegment } from "../../hooks/Segment/useCreateSegment";
import { useCreateSegmentCondition } from "../../hooks/Segment/useCreateSegmentCondition";
import { useDeleteSegment } from "../../hooks/Segment/useDeleteSegment";
import { useDeleteSegmentCondition } from "../../hooks/Segment/useDeleteSegmentCondition";
import { useReorderSegmentConditions } from "../../hooks/Segment/useReorderSegmentConditions";
import { useSegment } from "../../hooks/Segment/useSegment";
import { useSegmentOptions } from "../../hooks/Segment/useSegmentOptions";
import { useSegments } from "../../hooks/Segment/useSegments";
import { useUpdateSegment } from "../../hooks/Segment/useUpdateSegment";
import { useUpdateSegmentCondition } from "../../hooks/Segment/useUpdateSegmentCondition";

export const useSegmentUseCase = (projectId?: string, cursor?: string, segmentId?: string) => {
  const createSegmentMutation = useCreateSegment();
  const createConditionMutation = useCreateSegmentCondition();
  const deleteSegmentMutation = useDeleteSegment();
  const deleteConditionMutation = useDeleteSegmentCondition();
  const reorderConditionsMutation = useReorderSegmentConditions();
  const segmentOptionsQuery = useSegmentOptions(projectId);
  const segmentQuery = useSegment(projectId, segmentId);
  const segmentsQuery = useSegments(projectId, { cursor, limit: 25 });
  const updateSegmentMutation = useUpdateSegment();
  const updateConditionMutation = useUpdateSegmentCondition();

  const createSegment = (input: CreateSegmentInput) =>
    createSegmentMutation.mutateAsync({
      input,
      projectId: projectId as string
    });

  const updateSegment = (input: UpdateSegmentInput) =>
    updateSegmentMutation.mutateAsync({
      input,
      projectId: projectId as string,
      segmentId: segmentId as string
    });

  const deleteSegment = (targetSegmentId: string) =>
    deleteSegmentMutation.mutateAsync({
      projectId: projectId as string,
      segmentId: targetSegmentId
    });

  const createCondition = (input: CreateSegmentConditionInput) =>
    createConditionMutation.mutateAsync({
      input,
      projectId: projectId as string,
      segmentId: segmentId as string
    });

  const updateCondition = (conditionId: string, input: UpdateSegmentConditionInput) =>
    updateConditionMutation.mutateAsync({
      conditionId,
      input,
      projectId: projectId as string,
      segmentId: segmentId as string
    });

  const deleteCondition = (conditionId: string) =>
    deleteConditionMutation.mutateAsync({
      conditionId,
      projectId: projectId as string,
      segmentId: segmentId as string
    });

  const reorderConditions = (conditions: Segment["conditions"]) =>
    reorderConditionsMutation.mutateAsync({
      input: { conditionIds: conditions.map((condition) => condition.id) },
      projectId: projectId as string,
      segmentId: segmentId as string
    });

  return {
    conditionMutationError:
      createConditionMutation.error ?? updateConditionMutation.error ?? deleteConditionMutation.error ?? reorderConditionsMutation.error,
    createCondition,
    createSegment,
    createSegmentError: createSegmentMutation.error,
    deleteCondition,
    deleteSegment,
    deleteSegmentError: deleteSegmentMutation.error,
    deletingConditionId: deleteConditionMutation.isPending ? deleteConditionMutation.variables?.conditionId : undefined,
    deletingSegmentId: deleteSegmentMutation.isPending ? deleteSegmentMutation.variables?.segmentId : undefined,
    isCreatingCondition: createConditionMutation.isPending,
    isCreatingSegment: createSegmentMutation.isPending,
    isDeletingCondition: deleteConditionMutation.isPending,
    isDeletingSegment: deleteSegmentMutation.isPending,
    isLoadingSegment: segmentQuery.isLoading,
    isLoadingSegmentOptions: segmentOptionsQuery.isLoading,
    isLoadingSegments: segmentsQuery.isLoading,
    isReorderingConditions: reorderConditionsMutation.isPending,
    isUpdatingCondition: updateConditionMutation.isPending,
    isUpdatingSegment: updateSegmentMutation.isPending,
    pagination: segmentsQuery.data?.pagination ?? {
      hasNextPage: false,
      limit: 25,
      nextCursor: null
    },
    reorderConditions,
    segment: segmentQuery.data,
    segmentError: segmentQuery.error,
    segmentOptions: segmentOptionsQuery.data ?? [],
    segmentOptionsError: segmentOptionsQuery.error,
    segments: segmentsQuery.data?.entries ?? [],
    segmentsError: segmentsQuery.error,
    updateCondition,
    updateSegment,
    updateSegmentError: updateSegmentMutation.error,
    updatingConditionId: updateConditionMutation.isPending ? updateConditionMutation.variables?.conditionId : undefined
  };
};
