import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSegment } from "../../api/Segment";
import { segmentOptionsQueryKey } from "./useSegmentOptions";

interface DeleteSegmentVariables {
  projectId: string;
  segmentId: string;
}

export const useDeleteSegment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, segmentId }: DeleteSegmentVariables) => deleteSegment(projectId, segmentId),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["segments", variables.projectId] });
      void queryClient.invalidateQueries({ queryKey: segmentOptionsQueryKey(variables.projectId) });
    }
  });
};
