import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateEnvironmentInput } from "../../../core/types/Environment";
import { updateEnvironment } from "../../api/Environment";

interface UpdateEnvironmentVariables {
  environmentId: string;
  input: UpdateEnvironmentInput;
  projectId: string;
}

export const useUpdateEnvironment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ environmentId, input, projectId }: UpdateEnvironmentVariables) =>
      updateEnvironment(projectId, environmentId, input),
    onSuccess: (_environment, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["projects", variables.projectId, "environments"] });
    }
  });
};
