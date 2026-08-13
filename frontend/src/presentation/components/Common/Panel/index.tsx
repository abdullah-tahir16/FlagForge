import type { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  className?: string;
}

const Panel = ({ children, className = "" }: Props) => (
  <section className={`rounded-app border border-app-border bg-app-surface shadow-app ${className}`}>{children}</section>
);

export default Panel;
