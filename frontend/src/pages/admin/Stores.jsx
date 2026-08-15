import { useEffect, useState } from 'react';
import { Search, PlusCircle } from 'lucide-react';
import * as adminApi from '../../api/adminApi';
import { extractErrorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import useDebounce from '../../hooks/useDebounce';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import StarRating from '../../components/ui/StarRating';
import CreateStoreModal from '../../components/admin/CreateStoreModal';

export default function AdminStores() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(1);

  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminApi
      .listStores({ search: debouncedSearch, sortBy, order, page, limit: 10 })
      .then((res) => {
        if (cancelled) return;
        setStores(res.data);
        setPagination(res.pagination);
      })
      .catch((err) => !cancelled && toast.error(extractErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, sortBy, order, page, refreshKey]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setOrder('asc');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true, render: (s) => <span className="line-clamp-1">{s.address}</span> },
    {
      key: 'ownerName',
      label: 'Owner',
      render: (s) => (s.ownerName ? s.ownerName : <span className="text-muted">Unassigned</span>),
    },
    {
      key: 'averageRating',
      label: 'Rating',
      sortable: true,
      render: (s) => <StarRating value={s.averageRating || 0} readOnly showValue size={14} />,
    },
    { key: 'totalRatings', label: 'Total ratings' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Stores</h1>
          <p className="mt-1 text-sm text-muted">All registered stores and their reputation.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <PlusCircle size={16} /> Add store
        </Button>
      </div>

      <div className="relative w-full max-w-xs">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, address..."
          className="focus-ring w-full rounded border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted"
        />
      </div>

      <DataTable
        columns={columns}
        rows={stores}
        loading={loading}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        emptyTitle="No stores found"
        emptyDescription="Try a different search, or add a new store."
      />

      {!loading && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
        />
      )}

      <CreateStoreModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
