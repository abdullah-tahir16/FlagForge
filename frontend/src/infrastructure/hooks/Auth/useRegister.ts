import { useMutation } from "@tanstack/react-query";
import { register } from "../../api/Auth";

export const useRegister = () =>
  useMutation({
    mutationFn: register
  });
