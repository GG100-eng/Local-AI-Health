type Props = {
  value: number;
  max?: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
};

export function ProgressBar({
  value,
  max = 100,
  className = "",
  trackClassName = "",
  barClassName = "",
}: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full ${className}`}
    >
      <div
        className={`relative h-2 w-full overflow-hidden rounded-full bg-muted ${trackClassName}`}
      >
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-200 ease-out ${barClassName}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
