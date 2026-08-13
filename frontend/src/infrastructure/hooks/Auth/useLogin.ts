import { useMutation } from "@tanstack/react-query";
import { login } from "../../api/Auth";

export const useLogin = () =>
  useMutation({
    mutationFn: login
  });
