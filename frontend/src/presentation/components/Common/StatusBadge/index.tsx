interface Props {
  label: string;
}

const StatusBadge = ({ label }: Props) => (
  <div className="inline-flex min-h-7 items-center justify-end gap-2 rounded-app-sm border border-app-border bg-app-surface px-2.5 py-1 text-xs font-semibold text-app-text-muted">
    <span className="h-2.5 w-2.5 rounded-full bg-app-success" />
    <span className="capitalize">{label}</span>
  </div>
);

export default StatusBadge;
