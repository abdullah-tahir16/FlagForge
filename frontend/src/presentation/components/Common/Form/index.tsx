import type { FormEvent, FormHTMLAttributes, PropsWithChildren } from "react";
import Alert from "../Alert";

interface Props extends FormHTMLAttributes<HTMLFormElement>, PropsWithChildren {
  errorMessage?: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const Form = ({ children, className = "flex flex-col gap-4", errorMessage, onSubmit, ...props }: Props) => (
  <form className={className} onSubmit={onSubmit} {...props}>
    {children}
    {errorMessage ? (
      <Alert tone="danger">
        {errorMessage}
      </Alert>
    ) : null}
  </form>
);

export default Form;
