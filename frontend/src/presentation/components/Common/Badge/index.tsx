import type { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  tone?: "danger" | "info" | "neutral" | "primary" | "success" | "warning";
}

const Badge = ({ children, tone = "neutral" }: Props) => {
  const toneClass = {
    danger: "border-app-danger/25 bg-app-danger-muted text-app-danger",
    info: "border-app-info/25 bg-app-info-muted text-app-info",
    neutral: "border-app-border bg-app-surface-muted text-app-text-muted",
    primary: "border-app-primary/25 bg-app-primary-muted text-app-primary",
    success: "border-app-success/25 bg-app-surface text-app-success",
    warning: "border-app-warning/25 bg-app-warning-muted text-app-warning"
  }[tone];

  return (
    <span className={`inline-flex min-h-7 max-w-full items-center rounded-app-sm border px-2.5 py-1 text-xs font-semibold ${toneClass}`}>
      <span className="truncate">{children}</span>
    </span>
  );
};

export default Badge;
