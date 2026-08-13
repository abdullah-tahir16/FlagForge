import type { FormEvent, PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  errorMessage?: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const Form = ({ children, errorMessage, onSubmit }: Props) => (
  <form className="flex flex-col gap-4" onSubmit={onSubmit}>
    {children}
    {errorMessage ? (
      <p className="rounded-app border border-app-danger/20 bg-app-danger-muted px-3 py-2.5 text-sm font-medium text-app-danger" role="alert">
        {errorMessage}
      </p>
    ) : null}
  </form>
);

export default Form;
