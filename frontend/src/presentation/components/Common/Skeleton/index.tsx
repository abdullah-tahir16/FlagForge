interface Props {
  className?: string;
  rows?: number;
}

const Skeleton = ({ className = "", rows = 1 }: Props) => (
  <div className={`grid gap-2 ${className}`} aria-hidden="true">
    {Array.from({ length: rows }).map((_, index) => (
      <span className="block h-10 animate-pulse rounded-app bg-app-muted" key={index} />
    ))}
  </div>
);

export default Skeleton;
