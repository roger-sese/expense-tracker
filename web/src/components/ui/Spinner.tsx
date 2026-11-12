export function Spinner({ size = 'md', label }: { size?: 'sm' | 'md'; label?: string }) {
  return (
    <span className={`spinner spinner--${size}`} role="status" aria-label={label ?? 'Loading'} />
  );
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="page-loader">
      <Spinner label={label} />
      <span>{label}</span>
    </div>
  );
}
