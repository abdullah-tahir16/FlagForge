import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../api/Auth";
import { getAccessToken } from "../../api/Auth/session";

export const useCurrentUser = () =>
  useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    enabled: Boolean(getAccessToken()),
    retry: false
  });
