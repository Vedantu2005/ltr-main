import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { extractErrorMessage } from '../api/client';
import * as authApi from '../api/authApi';
import { validatePassword } from '../utils/validators';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPasswordError = validatePassword(form.newPassword);
    const currentPasswordError = form.currentPassword ? null : 'Current password is required';
    setErrors({ newPassword: newPasswordError, currentPassword: currentPasswordError });
    if (newPasswordError || currentPasswordError) return;

    setLoading(true);
    try {
      await authApi.changePassword(form);
      toast.success('Your password has been updated.');
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted">Your account details and security settings.</p>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Account details</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted">Name</dt>
            <dd className="text-sm font-medium text-foreground">{user.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Email</dt>
            <dd className="text-sm font-medium text-foreground">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Role</dt>
            <dd className="mt-0.5">
              <Badge variant="primary">{user.role.replace('_', ' ')}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Status</dt>
            <dd className="mt-0.5">
              <Badge variant={user.status === 'ACTIVE' ? 'success' : 'danger'}>{user.status}</Badge>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted">Address</dt>
            <dd className="text-sm font-medium text-foreground">{user.address}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Account created</dt>
            <dd className="text-sm font-medium text-foreground">
              {new Date(user.created_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Change password</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Current password"
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
            error={errors.currentPassword}
          />
          <Input
            label="New password"
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
            error={errors.newPassword}
          />
          <p className="text-xs text-muted">
            8–16 characters, at least one uppercase letter and one special character.
          </p>
          <Button type="submit" loading={loading} className="w-fit">
            <KeyRound size={16} />
            {loading ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
