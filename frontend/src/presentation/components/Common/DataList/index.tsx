import type { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  className?: string;
}

const DataList = ({ children, className = "" }: Props) => (
  <div className={`overflow-hidden rounded-app border border-app-border bg-app-surface ${className}`}>{children}</div>
);

export default DataList;
