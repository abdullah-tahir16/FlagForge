import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSegmentCondition } from "../../api/Segment";
import { segmentQueryKey } from "./useSegment";

interface DeleteSegmentConditionVariables {
  conditionId: string;
  projectId: string;
  segmentId: string;
}

export const useDeleteSegmentCondition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conditionId, projectId, segmentId }: DeleteSegmentConditionVariables) =>
      deleteSegmentCondition(projectId, segmentId, conditionId),
    onSuccess: (segment, variables) => {
      void queryClient.invalidateQueries({ queryKey: segmentQueryKey(variables.projectId, segment.id) });
    }
  });
};
