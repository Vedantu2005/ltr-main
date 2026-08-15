import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin } from 'lucide-react';
import * as storeApi from '../../api/storeApi';
import { extractErrorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import StarRating from '../../components/ui/StarRating';
import RatingDistribution from '../../components/ui/RatingDistribution';

export default function StoreDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    storeApi
      .getStore(id)
      .then(setStore)
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [id]);

  const handleRate = async (rating) => {
    setSubmitting(true);
    try {
      await storeApi.submitRating(id, rating);
      toast.success('Rating submitted successfully.');
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-40 rounded-lg" />
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link to="/stores" className="focus-ring inline-flex w-fit items-center gap-1.5 rounded text-sm text-muted hover:text-foreground">
        <ArrowLeft size={15} /> Back to stores
      </Link>

      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">{store.name}</h1>
        <div className="mt-2 flex flex-col gap-1 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} /> {store.address}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail size={14} /> {store.email}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm font-medium text-muted">Overall rating</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="font-serif text-4xl font-semibold text-foreground">
              {store.averageRating ? store.averageRating.toFixed(1) : '—'}
            </span>
            <div>
              <StarRating value={store.averageRating || 0} readOnly />
              <p className="mt-1 text-xs text-muted">Based on {store.totalRatings} rating{store.totalRatings === 1 ? '' : 's'}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <p className="mb-3 text-sm font-medium text-muted">Rating distribution</p>
          <RatingDistribution distribution={store.ratingDistribution} />
        </Card>
      </div>

      {user.role === 'USER' && (
        <Card className="p-5">
          <p className="text-sm font-medium text-muted">
            {store.myRating ? 'Your rating' : 'Rate this store'}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <StarRating value={store.myRating || 0} onChange={handleRate} size={28} />
            {submitting && <span className="text-xs text-muted">Saving...</span>}
          </div>
          {store.myRating && (
            <p className="mt-2 text-xs text-muted">
              You can change your rating anytime by selecting a different star.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
