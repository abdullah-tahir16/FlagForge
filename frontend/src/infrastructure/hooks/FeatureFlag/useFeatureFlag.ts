import { useQuery } from "@tanstack/react-query";
import { getFeatureFlag } from "../../api/FeatureFlag";

export const useFeatureFlag = (projectId?: string, flagId?: string) =>
  useQuery({
    enabled: Boolean(projectId && flagId),
    queryFn: () => getFeatureFlag(projectId as string, flagId as string),
    queryKey: ["feature-flags", projectId, flagId]
  });
