import { ArrowUp, ArrowDown, ArrowUpDown, Inbox } from 'lucide-react';

/**
 * columns: [{ key, label, sortable, render?(row) }]
 */
export default function DataTable({
  columns,
  rows,
  loading,
  sortBy,
  order,
  onSort,
  emptyTitle = 'No results found',
  emptyDescription = 'Try adjusting your search or filters.',
  rowKey = 'id',
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="sticky top-0 bg-surface-muted">
          <tr>
            {columns.map((col) => {
              const isActive = sortBy === col.key;
              const Icon = isActive ? (order === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
              return (
                <th key={col.key} className="border-b border-border px-4 py-3 font-medium text-muted">
                  {col.sortable ? (
                    <button
                      onClick={() => onSort(col.key)}
                      className="focus-ring inline-flex items-center gap-1 rounded hover:text-foreground"
                    >
                      {col.label}
                      <Icon size={13} className={isActive ? 'text-primary' : 'text-muted'} />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="skeleton h-4 w-24 rounded" />
                  </td>
                ))}
              </tr>
            ))}

          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-16">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Inbox size={28} className="text-muted" />
                  <p className="font-medium text-foreground">{emptyTitle}</p>
                  <p className="text-sm text-muted">{emptyDescription}</p>
                </div>
              </td>
            </tr>
          )}

          {!loading &&
            rows.map((row) => (
              <tr key={row[rowKey]} className="border-b border-border last:border-0 hover:bg-surface-muted/60">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-foreground">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
