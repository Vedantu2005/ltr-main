import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Ban, RotateCcw } from 'lucide-react';
import * as adminApi from '../../api/adminApi';
import { extractErrorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import useDebounce from '../../hooks/useDebounce';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CreateUserModal from '../../components/admin/CreateUserModal';

const ROLE_VARIANT = { ADMIN: 'primary', STORE_OWNER: 'warning', USER: 'neutral' };

export default function AdminUsers() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, role, status]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminApi
      .listUsers({ search: debouncedSearch, role, status, sortBy, order, page, limit: 10 })
      .then((res) => {
        if (cancelled) return;
        setUsers(res.data);
        setPagination(res.pagination);
      })
      .catch((err) => !cancelled && toast.error(extractErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, role, status, sortBy, order, page, refreshKey]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setOrder('asc');
    }
  };

  const toggleStatus = async (user) => {
    setBusyId(user.id);
    try {
      if (user.status === 'ACTIVE') {
        await adminApi.suspendUser(user.id);
        toast.success(`${user.name} has been suspended.`);
      } else {
        await adminApi.reactivateUser(user.id);
        toast.success(`${user.name} has been reactivated.`);
      }
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (u) => (
        <Link to={`/admin/users/${u.id}`} className="focus-ring rounded font-medium text-foreground hover:text-primary">
          {u.name}
        </Link>
      ),
    },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (u) => <Badge variant={ROLE_VARIANT[u.role]}>{u.role.replace('_', ' ')}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (u) => <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'}>{u.status}</Badge>,
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (u) => new Date(u.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (u) => (
        <Button
          variant="ghost"
          size="sm"
          loading={busyId === u.id}
          onClick={() => toggleStatus(u)}
        >
          {u.status === 'ACTIVE' ? <Ban size={14} /> : <RotateCcw size={14} />}
          {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Users</h1>
          <p className="mt-1 text-sm text-muted">Manage normal users, store owners, and administrators.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <UserPlus size={16} /> Add user
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, address..."
            className="focus-ring w-full rounded border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="focus-ring rounded border border-border bg-surface px-3 py-2 text-sm text-foreground"
        >
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
          <option value="STORE_OWNER">Store owner</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="focus-ring rounded border border-border bg-surface px-3 py-2 text-sm text-foreground"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={users}
        loading={loading}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        emptyTitle="No users found"
        emptyDescription="Try adjusting your search or filters."
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

      <CreateUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
