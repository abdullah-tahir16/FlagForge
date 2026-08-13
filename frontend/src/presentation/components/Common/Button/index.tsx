import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>, PropsWithChildren {
  variant?: "primary" | "secondary";
}

const Button = ({ children, className = "", variant = "primary", ...props }: Props) => {
  const variantClass =
    variant === "primary"
      ? "bg-app-primary text-white shadow-app-button hover:bg-app-primary-hover active:bg-app-primary-hover"
      : "border border-app-border bg-app-surface text-app-text hover:border-app-primary/50 hover:bg-app-surface-muted active:bg-app-muted";

  return (
    <button
      className={`min-h-11 cursor-pointer rounded-app px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-app-focus focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
