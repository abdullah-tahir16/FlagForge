import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>, PropsWithChildren {
  variant?: "danger" | "primary" | "secondary";
}

const Button = ({ children, className = "", variant = "primary", ...props }: Props) => {
  const variantClass = {
    danger:
      "bg-app-destructive text-app-on-primary shadow-app-button hover:bg-app-danger active:bg-app-danger",
    primary:
      "bg-app-primary text-app-on-primary shadow-app-button hover:bg-app-primary-hover active:bg-app-primary-hover",
    secondary:
      "border border-app-border bg-app-surface text-app-text hover:border-app-primary/50 hover:bg-app-surface-muted active:bg-app-muted"
  }[variant];

  return (
    <button
      className={`min-h-11 cursor-pointer rounded-app px-4 py-2.5 text-sm font-semibold transition duration-app focus:outline-none focus:ring-2 focus:ring-app-focus focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
