import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getAccessToken } from "../../api/Auth/session";
import { openRealtimeStream } from "../../api/Realtime/fns";
import { invalidateRealtimeEventQueries } from "./fns";

interface UseRealtimeUseCaseOptions {
  currentOrganizationId?: string;
  enabled: boolean;
}

export const useRealtimeUseCase = ({ currentOrganizationId, enabled }: UseRealtimeUseCaseOptions): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const accessToken = getAccessToken();

    if (!enabled || !accessToken) {
      return;
    }

    const controller = new AbortController();
    let reconnectTimer: number | undefined;
    let reconnectAttempts = 0;

    const connect = () => {
      void openRealtimeStream({
        accessToken,
        onEvent: (event) => invalidateRealtimeEventQueries(queryClient, event, currentOrganizationId),
        signal: controller.signal
      }).catch(() => {
        if (controller.signal.aborted) {
          return;
        }

        const delay = Math.min(30000, 1000 * 2 ** reconnectAttempts);
        reconnectAttempts += 1;
        reconnectTimer = window.setTimeout(connect, delay);
      });
    };

    connect();

    return () => {
      controller.abort();

      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer);
      }
    };
  }, [currentOrganizationId, enabled, queryClient]);
};
