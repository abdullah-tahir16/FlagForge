import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateProjectInput } from "../../../core/types/Project";
import { updateProject } from "../../api/Project";

interface UpdateProjectVariables {
  input: UpdateProjectInput;
  projectId: string;
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, projectId }: UpdateProjectVariables) => updateProject(projectId, input),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["projects", project.id] });
    }
  });
};
