import type { PropsWithChildren, ReactNode } from "react";

interface Props extends PropsWithChildren {
  actions?: ReactNode;
}

const Toolbar = ({ actions, children }: Props) => (
  <div className="mb-4 flex flex-col gap-3 rounded-app border border-app-border bg-app-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0 text-sm text-app-text-muted">{children}</div>
    {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
  </div>
);

export default Toolbar;
