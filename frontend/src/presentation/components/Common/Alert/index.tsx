import type { PropsWithChildren } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

interface Props extends PropsWithChildren {
  title?: string;
  tone?: "danger" | "info" | "success" | "warning";
}

const Alert = ({ children, title, tone = "info" }: Props) => {
  const toneClass = {
    danger: "border-app-danger/25 bg-app-danger-muted text-app-danger",
    info: "border-app-info/25 bg-app-info-muted text-app-info",
    success: "border-app-success/25 bg-app-surface text-app-success",
    warning: "border-app-warning/25 bg-app-warning-muted text-app-warning"
  }[tone];
  const Icon = {
    danger: AlertCircle,
    info: Info,
    success: CheckCircle2,
    warning: TriangleAlert
  }[tone];

  return (
    <div className={`flex gap-3 rounded-app border px-3 py-2.5 text-sm ${toneClass}`} role={tone === "danger" ? "alert" : "status"}>
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "mt-1 leading-5" : "leading-5"}>{children}</div>
      </div>
    </div>
  );
};

export default Alert;
