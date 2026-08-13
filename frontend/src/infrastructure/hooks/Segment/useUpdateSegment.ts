import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateSegmentInput } from "../../../core/types/Segment";
import { updateSegment } from "../../api/Segment";
import { segmentOptionsQueryKey } from "./useSegmentOptions";
import { segmentQueryKey } from "./useSegment";

interface UpdateSegmentVariables {
  input: UpdateSegmentInput;
  projectId: string;
  segmentId: string;
}

export const useUpdateSegment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, projectId, segmentId }: UpdateSegmentVariables) => updateSegment(projectId, segmentId, input),
    onSuccess: (segment, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["segments", variables.projectId] });
      void queryClient.invalidateQueries({ queryKey: segmentOptionsQueryKey(variables.projectId) });
      void queryClient.invalidateQueries({ queryKey: segmentQueryKey(variables.projectId, segment.id) });
    }
  });
};
