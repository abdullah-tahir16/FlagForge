import { useQuery } from "@tanstack/react-query";
import { getEnvironmentSdkKeys } from "../../api/SdkKey";

export const sdkKeysQueryKey = (projectId?: string, environmentId?: string) => ["sdk-keys", projectId, environmentId];

export const useEnvironmentSdkKeys = (projectId?: string, environmentId?: string) =>
  useQuery({
    enabled: Boolean(projectId && environmentId),
    queryFn: () => getEnvironmentSdkKeys(projectId as string, environmentId as string),
    queryKey: sdkKeysQueryKey(projectId, environmentId)
  });
