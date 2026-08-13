import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "../../api/Auth/session";
import { getSegmentOptions } from "../../api/Segment";

export const segmentOptionsQueryKey = (projectId?: string) => ["segment-options", projectId];

export const useSegmentOptions = (projectId?: string) =>
  useQuery({
    enabled: Boolean(getAccessToken() && projectId),
    queryFn: () => getSegmentOptions(projectId as string),
    queryKey: segmentOptionsQueryKey(projectId),
    retry: false
  });
