import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import StarRating from '../ui/StarRating';

export default function StoreCard({ store, onRate, ratingPending }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-subtle transition-shadow hover:shadow-card">
      <div>
        <Link
          to={`/stores/${store.id}`}
          className="focus-ring rounded font-serif text-lg font-semibold text-foreground hover:text-primary"
        >
          {store.name}
        </Link>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-muted">
          <MapPin size={14} className="mt-0.5 shrink-0" />
          {store.address}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <StarRating value={store.averageRating || 0} readOnly showValue size={16} />
        <span className="text-xs text-muted">
          ({store.totalRatings} rating{store.totalRatings === 1 ? '' : 's'})
        </span>
      </div>

      <div className="mt-auto border-t border-border pt-3">
        <p className="mb-1.5 text-xs font-medium text-muted">
          {store.myRating ? 'Your rating' : 'Rate this store'}
        </p>
        <StarRating
          value={store.myRating || 0}
          onChange={(value) => onRate(store.id, value)}
          size={20}
        />
        {ratingPending && <p className="mt-1 text-xs text-muted">Saving...</p>}
      </div>
    </div>
  );
}
