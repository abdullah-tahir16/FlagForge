import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { RealtimeEvent } from "../../../core/types/Realtime";

export const invalidateRealtimeEventQueries = (queryClient: QueryClient, event: RealtimeEvent, currentOrganizationId?: string): void => {
  if (currentOrganizationId && event.organizationId !== currentOrganizationId) {
    return;
  }

  void queryClient.invalidateQueries({
    predicate: ({ queryKey }) => shouldInvalidateQuery(queryKey, event)
  });
};

export const shouldInvalidateQuery = (queryKey: QueryKey, event: RealtimeEvent): boolean => {
  const [scope, projectId] = queryKey;

  if (scope === "audit-logs") {
    return true;
  }

  if (scope === "feature-flags" && projectId === event.projectId) {
    return true;
  }

  if (scope === "targeting-rules" && projectId === event.projectId) {
    return true;
  }

  if ((scope === "segments" || scope === "segment-options") && projectId === event.projectId) {
    return true;
  }

  return false;
};
