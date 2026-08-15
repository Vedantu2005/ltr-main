import { useEffect, useState } from 'react';
import { Star, Users, MessageSquare } from 'lucide-react';
import * as storeOwnerApi from '../../api/storeOwnerApi';
import { extractErrorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import StarRating from '../../components/ui/StarRating';
import RatingDistribution from '../../components/ui/RatingDistribution';

export default function StoreOwnerDashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    storeOwnerApi
      .getDashboard()
      .then(setData)
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error(extractErrorMessage(err));
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
        <Star size={28} className="text-muted" />
        <p className="font-medium text-foreground">No store assigned yet.</p>
        <p className="text-sm text-muted">Ask an administrator to assign a store to your account.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">{data.store.name}</h1>
        <p className="mt-1 text-sm text-muted">{data.store.address}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Average rating" value={data.averageRating ? data.averageRating.toFixed(1) : '—'} icon={Star} />
        <StatCard label="Total ratings" value={data.totalRatings} icon={MessageSquare} />
        <StatCard label="Unique reviewers" value={data.raters.length} icon={Users} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">Rating distribution</p>
          <RatingDistribution distribution={data.ratingDistribution} />
        </Card>

        <Card className="flex flex-col p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">Recent reviewers</p>
          {data.raters.length === 0 ? (
            <p className="text-sm text-muted">No ratings yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border overflow-y-auto">
              {data.raters.slice(0, 8).map((rater) => (
                <li key={rater.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">{rater.name}</p>
                    <p className="text-xs text-muted">{rater.email}</p>
                  </div>
                  <StarRating value={rater.rating} readOnly size={14} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
