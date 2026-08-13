import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProject } from "../../api/Project";

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (_result, projectId) => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.removeQueries({ queryKey: ["projects", projectId] });
    }
  });
};
