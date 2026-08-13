import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface Props {
  action?: ReactNode;
  description?: string;
  icon?: LucideIcon;
  title: string;
}

const EmptyState = ({ action, description, icon: Icon = Inbox, title }: Props) => (
  <div className="flex flex-col items-start gap-3 rounded-app border border-app-border bg-app-surface-muted px-4 py-5 text-sm">
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-app border border-app-border bg-app-surface text-app-primary">
      <Icon aria-hidden="true" className="h-4 w-4" />
    </span>
    <div>
      <p className="font-semibold text-app-text">{title}</p>
      {description ? <p className="mt-1 max-w-xl leading-6 text-app-text-muted">{description}</p> : null}
    </div>
    {action ? <div className="pt-1">{action}</div> : null}
  </div>
);

export default EmptyState;
