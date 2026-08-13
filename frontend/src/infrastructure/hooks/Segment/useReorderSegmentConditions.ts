import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReorderSegmentConditionsInput } from "../../../core/types/Segment";
import { reorderSegmentConditions } from "../../api/Segment";
import { segmentQueryKey } from "./useSegment";

interface ReorderSegmentConditionsVariables {
  input: ReorderSegmentConditionsInput;
  projectId: string;
  segmentId: string;
}

export const useReorderSegmentConditions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, projectId, segmentId }: ReorderSegmentConditionsVariables) =>
      reorderSegmentConditions(projectId, segmentId, input),
    onSuccess: (segment, variables) => {
      void queryClient.invalidateQueries({ queryKey: segmentQueryKey(variables.projectId, segment.id) });
    }
  });
};
