import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateSegmentConditionInput } from "../../../core/types/Segment";
import { createSegmentCondition } from "../../api/Segment";
import { segmentQueryKey } from "./useSegment";

interface CreateSegmentConditionVariables {
  input: CreateSegmentConditionInput;
  projectId: string;
  segmentId: string;
}

export const useCreateSegmentCondition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, projectId, segmentId }: CreateSegmentConditionVariables) => createSegmentCondition(projectId, segmentId, input),
    onSuccess: (segment, variables) => {
      void queryClient.invalidateQueries({ queryKey: segmentQueryKey(variables.projectId, segment.id) });
    }
  });
};
