import AuthForm from "../../components/Auth";
import { useLoginFeature } from "../../hooks/Login/useLoginFeature";

interface Props {}

const LoginContainer = (_props: Props) => {
  const feature = useLoginFeature();

  return (
    <AuthForm
      alternateHref="/register"
      alternateLabel="Create an account"
      errorMessage={feature.errorMessage}
      fields={[
        {
          autoComplete: "email",
          label: "Email",
          name: "email",
          type: "email"
        },
        {
          autoComplete: "current-password",
          label: "Password",
          name: "password",
          type: "password"
        }
      ]}
      initialValues={feature.initialValues}
      isSubmitting={feature.isSubmitting}
      onSubmit={feature.onSubmit}
      submitLabel="Log in"
      title="Log in"
      validate={feature.validate}
    />
  );
};

export default LoginContainer;
