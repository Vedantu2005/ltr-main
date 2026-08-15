import { useEffect, useState } from 'react';
import { Search, Store as StoreIcon } from 'lucide-react';
import * as storeApi from '../../api/storeApi';
import { extractErrorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import StoreCard from '../../components/store/StoreCard';
import Pagination from '../../components/ui/Pagination';

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'averageRating', label: 'Highest rated' },
  { value: 'created_at', label: 'Newest' },
];

export default function StoreList() {
  const { user } = useAuth();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);

  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 9 });
  const [loading, setLoading] = useState(true);
  const [pendingStoreId, setPendingStoreId] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    storeApi
      .listStores({ search: debouncedSearch, sortBy, order: 'asc', page, limit: 9 })
      .then((res) => {
        if (cancelled) return;
        setStores(res.data);
        setPagination(res.pagination);
      })
      .catch((err) => {
        if (!cancelled) toast.error(extractErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, sortBy, page]);

  const handleRate = async (storeId, rating) => {
    setPendingStoreId(storeId);
    try {
      await storeApi.submitRating(storeId, rating);
      setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, myRating: rating } : s)));
      toast.success('Rating submitted successfully.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setPendingStoreId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Welcome, {user.name.split(' ')[0]}</h1>
        <p className="mt-1 text-sm text-muted">Search stores, see what others think, and share your own rating.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or address..."
            className="focus-ring w-full rounded border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="focus-ring rounded border border-border bg-surface px-3 py-2 text-sm text-foreground"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort by: {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-lg" />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <StoreIcon size={28} className="text-muted" />
          <p className="font-medium text-foreground">No stores found.</p>
          <p className="text-sm text-muted">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onRate={handleRate}
              ratingPending={pendingStoreId === store.id}
            />
          ))}
        </div>
      )}

      {!loading && stores.length > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
