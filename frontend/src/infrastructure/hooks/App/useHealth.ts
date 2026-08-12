import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../../api/App";

export const useHealth = () =>
  useQuery({
    queryKey: ["app", "health"],
    queryFn: getHealth,
    retry: 1
  });
