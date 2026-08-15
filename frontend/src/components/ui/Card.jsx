export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface shadow-subtle ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
