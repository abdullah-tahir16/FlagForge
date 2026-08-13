interface Props {
  label: string;
}

const StatusBadge = ({ label }: Props) => (
  <div className="flex items-center justify-end gap-2 text-app-text-muted">
    <span className="h-2.5 w-2.5 rounded-full bg-app-success" />
    <span className="capitalize">{label}</span>
  </div>
);

export default StatusBadge;
