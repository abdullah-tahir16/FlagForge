import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "../../api/Auth/session";
import { getProjectEnvironments } from "../../api/Environment";

export const useProjectEnvironments = (projectId: string | undefined) =>
  useQuery({
    queryKey: ["projects", projectId, "environments"],
    queryFn: () => getProjectEnvironments(projectId as string),
    enabled: Boolean(getAccessToken() && projectId),
    retry: false
  });
