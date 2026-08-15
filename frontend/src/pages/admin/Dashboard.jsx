import { useEffect, useState } from 'react';
import { Users, Store, Star, TrendingUp, UserCheck, UserX } from 'lucide-react';
import * as adminApi from '../../api/adminApi';
import { extractErrorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/ui/StatCard';

export default function AdminDashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getDashboard()
      .then(setData)
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Overview</h1>
        <p className="mt-1 text-sm text-muted">Live platform statistics, computed from the database.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total users" value={data?.totalUsers} icon={Users} loading={loading} />
        <StatCard label="Total stores" value={data?.totalStores} icon={Store} loading={loading} />
        <StatCard label="Total ratings" value={data?.totalRatings} icon={Star} loading={loading} />
        <StatCard
          label="Average platform rating"
          value={data?.averagePlatformRating != null ? data.averagePlatformRating.toFixed(2) : '—'}
          icon={TrendingUp}
          loading={loading}
        />
        <StatCard label="Active users" value={data?.activeUsers} icon={UserCheck} loading={loading} />
        <StatCard label="Suspended users" value={data?.suspendedUsers} icon={UserX} loading={loading} />
      </div>
    </div>
  );
}
