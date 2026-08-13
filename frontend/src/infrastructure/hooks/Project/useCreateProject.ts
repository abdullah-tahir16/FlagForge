import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "../../api/Project";

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });
};
