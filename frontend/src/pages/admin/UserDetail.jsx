import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import * as adminApi from '../../api/adminApi';
import { extractErrorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StarRating from '../../components/ui/StarRating';

const ROLE_VARIANT = { ADMIN: 'primary', STORE_OWNER: 'warning', USER: 'neutral' };

export default function AdminUserDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getUserDetail(id)
      .then(setUser)
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-56 rounded-lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        to="/admin/users"
        className="focus-ring inline-flex w-fit items-center gap-1.5 rounded text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={15} /> Back to users
      </Link>

      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-muted text-xl font-semibold text-primary">
          {user.name.charAt(0)}
        </span>
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">{user.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={ROLE_VARIANT[user.role]}>{user.role.replace('_', ' ')}</Badge>
            <Badge variant={user.status === 'ACTIVE' ? 'success' : 'danger'}>{user.status}</Badge>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted">Email</dt>
            <dd className="text-sm font-medium text-foreground">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Account created</dt>
            <dd className="text-sm font-medium text-foreground">{new Date(user.created_at).toLocaleDateString()}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted">Address</dt>
            <dd className="text-sm font-medium text-foreground">{user.address}</dd>
          </div>
          {user.role === 'STORE_OWNER' && (
            <div className="sm:col-span-2">
              <dt className="mb-1 text-xs text-muted">Store rating</dt>
              <dd>
                {user.averageRating != null ? (
                  <div className="flex items-center gap-2">
                    <StarRating value={user.averageRating} readOnly showValue />
                    <span className="text-xs text-muted">({user.totalRatings} ratings)</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted">No ratings yet</span>
                )}
              </dd>
            </div>
          )}
        </dl>
      </Card>
    </div>
  );
}
