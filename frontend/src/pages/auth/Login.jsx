import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../api/client';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ROLE_HOME = { ADMIN: '/admin', USER: '/stores', STORE_OWNER: '/store-owner' };

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}.`);
      const from = location.state?.from?.pathname;
      navigate(from || ROLE_HOME[user.role] || '/', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Welcome back. Enter your details to continue.</p>
      </div>

      {error && (
        <div className="rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted">
            <input type="checkbox" className="focus-ring rounded border-border" defaultChecked />
            Remember me
          </label>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          <LogIn size={16} />
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        New to RateSphere?
        <span className="h-px flex-1 bg-border" />
      </div>

      <Link
        to="/register"
        className="focus-ring w-full rounded border border-border py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
      >
        Create an account
      </Link>
    </div>
  );
}
