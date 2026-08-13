import type { PropsWithChildren, ReactNode } from "react";

interface Props extends PropsWithChildren {
  actions?: ReactNode;
  className?: string;
}

const DataRow = ({ actions, children, className = "" }: Props) => (
  <div className={`grid gap-3 border-b border-app-border px-4 py-3 last:border-b-0 hover:bg-app-row-hover md:grid-cols-[minmax(0,1fr)_auto] md:items-center ${className}`}>
    <div className="min-w-0">{children}</div>
    {actions ? <div className="flex min-w-0 flex-wrap items-center gap-2 md:justify-end">{actions}</div> : null}
  </div>
);

export default DataRow;
