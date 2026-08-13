import type { ReactNode } from "react";

interface Props {
  actions?: ReactNode;
  description?: string;
  eyebrow?: ReactNode;
  metadata?: ReactNode;
  title: string;
}

const PageHeader = ({ actions, description, eyebrow, metadata, title }: Props) => (
  <header className="mb-6 flex flex-col gap-4 border-b border-app-border pb-5 md:flex-row md:items-start md:justify-between">
    <div className="min-w-0">
      {eyebrow ? <div className="mb-2 flex flex-wrap items-center gap-2">{eyebrow}</div> : null}
      <h1 className="text-2xl font-semibold tracking-normal text-app-text md:text-3xl">{title}</h1>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-app-text-muted">{description}</p> : null}
      {metadata ? <div className="mt-3 flex flex-wrap gap-2">{metadata}</div> : null}
    </div>
    {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
  </header>
);

export default PageHeader;
