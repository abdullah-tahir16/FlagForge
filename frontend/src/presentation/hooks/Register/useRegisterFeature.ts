import { useNavigate } from "react-router-dom";
import { useAuthUseCase } from "../../../infrastructure/useCases/Auth/useAuthUseCase";
import { validateWithSchema } from "../Auth/fns";
import { registerSchema } from "./data";

export const useRegisterFeature = () => {
  const navigate = useNavigate();
  const auth = useAuthUseCase();

  const onSubmit = async (values: Record<string, string>) => {
    await auth.register(registerSchema.parse(values));
    navigate("/");
  };

  return {
    errorMessage: auth.registerError ? "Registration failed. Check the details and try again." : null,
    initialValues: {
      email: "",
      firstName: "",
      lastName: "",
      organizationName: "",
      password: ""
    },
    isSubmitting: auth.isRegistering,
    onSubmit,
    validate: validateWithSchema(registerSchema)
  };
};
