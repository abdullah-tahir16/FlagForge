import { useNavigate } from "react-router-dom";
import { useAuthUseCase } from "../../../infrastructure/useCases/Auth/useAuthUseCase";
import { validateWithSchema } from "../Auth/fns";
import { loginSchema } from "./data";

export const useLoginFeature = () => {
  const navigate = useNavigate();
  const auth = useAuthUseCase();

  const onSubmit = async (values: Record<string, string>) => {
    await auth.login(loginSchema.parse(values));
    navigate("/");
  };

  return {
    errorMessage: auth.loginError ? "Invalid email or password" : null,
    initialValues: {
      email: "",
      password: ""
    },
    isSubmitting: auth.isLoggingIn,
    onSubmit,
    validate: validateWithSchema(loginSchema)
  };
};
