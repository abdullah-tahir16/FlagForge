import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateSegmentConditionInput } from "../../../core/types/Segment";
import { updateSegmentCondition } from "../../api/Segment";
import { segmentQueryKey } from "./useSegment";

interface UpdateSegmentConditionVariables {
  conditionId: string;
  input: UpdateSegmentConditionInput;
  projectId: string;
  segmentId: string;
}

export const useUpdateSegmentCondition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conditionId, input, projectId, segmentId }: UpdateSegmentConditionVariables) =>
      updateSegmentCondition(projectId, segmentId, conditionId, input),
    onSuccess: (segment, variables) => {
      void queryClient.invalidateQueries({ queryKey: segmentQueryKey(variables.projectId, segment.id) });
    }
  });
};
