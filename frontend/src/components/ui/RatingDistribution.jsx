import { Star } from 'lucide-react';

export default function RatingDistribution({ distribution }) {
  const total = Object.values(distribution).reduce((sum, n) => sum + n, 0);

  return (
    <div className="flex flex-col gap-2">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star] || 0;
        const pct = total ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-2 text-sm">
            <span className="flex w-10 items-center gap-1 text-muted">
              {star} <Star size={12} className="fill-muted text-muted" />
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs text-muted">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
