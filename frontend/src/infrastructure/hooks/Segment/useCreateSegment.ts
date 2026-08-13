import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateSegmentInput } from "../../../core/types/Segment";
import { createSegment } from "../../api/Segment";
import { segmentOptionsQueryKey } from "./useSegmentOptions";

interface CreateSegmentVariables {
  input: CreateSegmentInput;
  projectId: string;
}

export const useCreateSegment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, projectId }: CreateSegmentVariables) => createSegment(projectId, input),
    onSuccess: (segment, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["segments", variables.projectId] });
      void queryClient.invalidateQueries({ queryKey: segmentOptionsQueryKey(variables.projectId) });
      void queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    }
  });
};
