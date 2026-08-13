import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCurrentOrganization } from "../../api/Organization";

export const useUpdateCurrentOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCurrentOrganization,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["organizations", "current"] });
    }
  });
};
