import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "../../api/Auth/session";
import { getSegment } from "../../api/Segment";

export const segmentQueryKey = (projectId?: string, segmentId?: string) => ["segments", projectId, segmentId];

export const useSegment = (projectId?: string, segmentId?: string) =>
  useQuery({
    enabled: Boolean(getAccessToken() && projectId && segmentId),
    queryFn: () => getSegment(projectId as string, segmentId as string),
    queryKey: segmentQueryKey(projectId, segmentId),
    retry: false
  });
