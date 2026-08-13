import { useEffect, useState } from "react";
import { useAuthUseCase } from "../../../infrastructure/useCases/Auth/useAuthUseCase";
import { useRealtimeUseCase } from "../../../infrastructure/useCases/Realtime/useRealtimeUseCase";

export const useProtectedRouteFeature = () => {
  const auth = useAuthUseCase();
  const [hasTriedRestore, setHasTriedRestore] = useState(false);
  const isAllowed = auth.isAuthenticated;

  useEffect(() => {
    if (auth.hasAccessToken || hasTriedRestore || auth.isRestoringSession) {
      return;
    }

    void auth
      .restoreSession()
      .catch(() => undefined)
      .finally(() => setHasTriedRestore(true));
  }, [auth, hasTriedRestore]);

  useRealtimeUseCase({
    currentOrganizationId: auth.currentUser?.organizationId,
    enabled: isAllowed
  });

  return {
    isAllowed,
    isChecking: auth.isCheckingCurrentUser || auth.isRestoringSession || (!auth.hasAccessToken && !hasTriedRestore)
  };
};
