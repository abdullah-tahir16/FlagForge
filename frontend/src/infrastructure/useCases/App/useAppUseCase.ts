import { useHealth } from "../../hooks/App/useHealth";

export const useAppUseCase = () => {
  const healthQuery = useHealth();

  return {
    apiStatus: healthQuery.data?.status ?? "offline",
    isCheckingApi: healthQuery.isLoading,
    isApiAvailable: healthQuery.data?.status === "ok",
    apiServiceName: healthQuery.data?.service ?? "flagforge-api"
  };
};
