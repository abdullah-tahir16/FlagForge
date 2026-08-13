import { useEffect, useState } from "react";
import { useAuthUseCase } from "../../../infrastructure/useCases/Auth/useAuthUseCase";

export const useProtectedRouteFeature = () => {
  const auth = useAuthUseCase();
  const [hasTriedRestore, setHasTriedRestore] = useState(false);

  useEffect(() => {
    if (auth.hasAccessToken || hasTriedRestore || auth.isRestoringSession) {
      return;
    }

    void auth
      .restoreSession()
      .catch(() => undefined)
      .finally(() => setHasTriedRestore(true));
  }, [auth, hasTriedRestore]);

  return {
    isAllowed: auth.isAuthenticated,
    isChecking: auth.isCheckingCurrentUser || auth.isRestoringSession || (!auth.hasAccessToken && !hasTriedRestore)
  };
};
