import { useMutation } from "@tanstack/react-query";
import { logout } from "../../api/Auth";

export const useLogout = () =>
  useMutation({
    mutationFn: logout
  });
