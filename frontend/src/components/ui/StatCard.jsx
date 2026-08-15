export default function StatCard({ label, value, icon: Icon, loading, accent = 'primary' }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-subtle">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        {Icon && (
          <span
            className={`flex h-8 w-8 items-center justify-center rounded ${
              accent === 'primary' ? 'bg-primary-muted text-primary' : 'bg-surface-muted text-muted'
            }`}
          >
            <Icon size={16} />
          </span>
        )}
      </div>
      {loading ? (
        <div className="skeleton mt-3 h-8 w-20 rounded" />
      ) : (
        <p className="mt-2 font-serif text-3xl font-semibold text-foreground">{value}</p>
      )}
    </div>
  );
}
