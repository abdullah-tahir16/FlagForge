import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label: string;
}

const TextInput = ({ error, id, label, ...props }: Props) => {
  const inputId = id ?? props.name;
  const errorId = `${inputId}-error`;

  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-app-text" htmlFor={inputId}>
      {label}
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className="min-h-11 rounded-app border border-app-border bg-app-surface px-3.5 py-2 text-base text-app-text outline-none transition duration-app placeholder:text-app-text-muted/70 hover:border-app-primary/50 focus:border-app-primary focus:ring-2 focus:ring-app-focus/70"
        id={inputId}
        {...props}
      />
      {error ? (
        <span className="text-sm font-normal text-app-danger" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
};

export default TextInput;
