import AuthForm from "../../components/Auth";
import { useRegisterFeature } from "../../hooks/Register/useRegisterFeature";

interface Props {}

const RegisterContainer = (_props: Props) => {
  const feature = useRegisterFeature();

  return (
    <AuthForm
      alternateHref="/login"
      alternateLabel="Already have an account?"
      errorMessage={feature.errorMessage}
      fields={[
        {
          autoComplete: "given-name",
          label: "First name",
          name: "firstName",
          type: "text"
        },
        {
          autoComplete: "family-name",
          label: "Last name",
          name: "lastName",
          type: "text"
        },
        {
          label: "Organization",
          name: "organizationName",
          type: "text"
        },
        {
          autoComplete: "email",
          label: "Email",
          name: "email",
          type: "email"
        },
        {
          autoComplete: "new-password",
          label: "Password",
          name: "password",
          type: "password"
        }
      ]}
      initialValues={feature.initialValues}
      isSubmitting={feature.isSubmitting}
      onSubmit={feature.onSubmit}
      submitLabel="Create account"
      title="Create account"
      validate={feature.validate}
    />
  );
};

export default RegisterContainer;
