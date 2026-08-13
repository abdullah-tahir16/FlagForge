import { useQuery } from "@tanstack/react-query";
import { getCurrentOrganization } from "../../api/Organization";
import { getAccessToken } from "../../api/Auth/session";

export const useCurrentOrganization = () =>
  useQuery({
    queryKey: ["organizations", "current"],
    queryFn: getCurrentOrganization,
    enabled: Boolean(getAccessToken()),
    retry: false
  });
