import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, total, limit, onPageChange }) {
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between px-1 py-3 text-sm text-muted">
        <span>{total} result{total === 1 ? '' : 's'}</span>
      </div>
    );
  }

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i += 1) pages.push(i);

  const rangeStart = (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3 text-sm">
      <span className="text-muted">
        Showing {rangeStart}–{rangeEnd} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          className="focus-ring flex h-8 w-8 items-center justify-center rounded border border-border text-foreground hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-transparent"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`focus-ring flex h-8 w-8 items-center justify-center rounded border text-sm ${
              p === page
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-foreground hover:bg-surface-muted'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          className="focus-ring flex h-8 w-8 items-center justify-center rounded border border-border text-foreground hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-transparent"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
