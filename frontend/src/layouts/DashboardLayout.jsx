import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ThemeToggle from '../components/ui/ThemeToggle';

const NAV_BY_ROLE = {
  ADMIN: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/stores', label: 'Stores', icon: Store },
  ],
  USER: [{ to: '/stores', label: 'Stores', icon: Store, end: true }],
  STORE_OWNER: [{ to: '/store-owner', label: 'Dashboard', icon: LayoutDashboard, end: true }],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = NAV_BY_ROLE[user.role] || [];

  const handleLogout = async () => {
    await logout();
    toast.info('You have been logged out.');
    navigate('/login');
  };

  const NavList = ({ onNavigate }) => (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `focus-ring flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-muted text-primary'
                : 'text-muted hover:bg-surface-muted hover:text-foreground'
            }`
          }
        >
          <Icon size={17} />
          {label}
        </NavLink>
      ))}
      <NavLink
        to="/profile"
        onClick={onNavigate}
        className={({ isActive }) =>
          `focus-ring flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors ${
            isActive ? 'bg-primary-muted text-primary' : 'text-muted hover:bg-surface-muted hover:text-foreground'
          }`
        }
      >
        <UserIcon size={17} />
        Profile
      </NavLink>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
            <Sparkles size={16} />
          </span>
          <span className="font-serif text-lg font-semibold text-foreground">RateSphere</span>
        </div>
        <NavList />
        <div className="border-t border-border p-3">
          <button
            onClick={handleLogout}
            className="focus-ring flex w-full items-center gap-3 rounded px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-danger"
          >
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-surface shadow-card animate-fade-in">
            <div className="flex items-center justify-between px-5 py-5">
              <span className="font-serif text-lg font-semibold text-foreground">RateSphere</span>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="focus-ring rounded">
                <X size={18} />
              </button>
            </div>
            <NavList onNavigate={() => setDrawerOpen(false)} />
            <div className="border-t border-border p-3">
              <button
                onClick={handleLogout}
                className="focus-ring flex w-full items-center gap-3 rounded px-3 py-2 text-sm font-medium text-muted hover:text-danger"
              >
                <LogOut size={17} />
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 md:px-6">
          <button
            className="focus-ring rounded text-foreground md:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="hidden text-sm text-muted md:block">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-sm font-medium text-foreground">{user.name}</span>
              <span className="text-xs text-muted">{user.role.replace('_', ' ')}</span>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-muted text-sm font-semibold text-primary">
              {user.name.charAt(0)}
            </span>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
