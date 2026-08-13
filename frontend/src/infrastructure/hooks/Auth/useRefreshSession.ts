import { useMutation } from "@tanstack/react-query";
import { refreshSession } from "../../api/Auth";

export const useRefreshSession = () =>
  useMutation({
    mutationFn: refreshSession
  });
