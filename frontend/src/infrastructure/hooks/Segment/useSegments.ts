import { useQuery } from "@tanstack/react-query";
import type { SegmentListParams } from "../../../core/types/Segment";
import { getAccessToken } from "../../api/Auth/session";
import { getSegments } from "../../api/Segment";

export const segmentsQueryKey = (projectId?: string, params: SegmentListParams = {}) => ["segments", projectId, params];

export const useSegments = (projectId?: string, params: SegmentListParams = {}) =>
  useQuery({
    enabled: Boolean(getAccessToken() && projectId),
    queryFn: () => getSegments(projectId as string, params),
    queryKey: segmentsQueryKey(projectId, params),
    retry: false
  });
