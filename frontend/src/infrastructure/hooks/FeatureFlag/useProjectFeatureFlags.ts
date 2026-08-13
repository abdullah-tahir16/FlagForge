import { useQuery } from "@tanstack/react-query";
import { getProjectFeatureFlags } from "../../api/FeatureFlag";

export const useProjectFeatureFlags = (projectId?: string) =>
  useQuery({
    enabled: Boolean(projectId),
    queryFn: () => getProjectFeatureFlags(projectId as string),
    queryKey: ["feature-flags", projectId]
  });
