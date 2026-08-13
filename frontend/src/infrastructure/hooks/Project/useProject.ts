import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "../../api/Auth/session";
import { getProject } from "../../api/Project";

export const useProject = (projectId: string | undefined) =>
  useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => getProject(projectId as string),
    enabled: Boolean(getAccessToken() && projectId),
    retry: false
  });
