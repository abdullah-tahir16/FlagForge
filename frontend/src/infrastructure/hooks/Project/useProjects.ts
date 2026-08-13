import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "../../api/Auth/session";
import { getProjects } from "../../api/Project";

export const useProjects = () =>
  useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    enabled: Boolean(getAccessToken()),
    retry: false
  });
