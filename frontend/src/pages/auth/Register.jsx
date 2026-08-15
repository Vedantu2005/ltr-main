import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../api/client';
import { validateName, validateEmail, validateAddress, validatePassword } from '../../utils/validators';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const initialForm = { name: '', email: '', address: '', password: '' };

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const validate = () => {
    const errors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    };
    setFieldErrors(errors);
    return Object.values(errors).every((v) => !v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Account created. Welcome, ${user.name.split(' ')[0]}.`);
      navigate('/stores', { replace: true });
    } catch (err) {
      setServerError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Join RateSphere to start rating the stores you know.</p>
      </div>

      {serverError && (
        <div className="rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={setField('name')}
          error={fieldErrors.name}
        />
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={form.email}
          onChange={setField('email')}
          error={fieldErrors.email}
        />
        <Input
          label="Address"
          name="address"
          autoComplete="street-address"
          value={form.address}
          onChange={setField('address')}
          error={fieldErrors.address}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          value={form.password}
          onChange={setField('password')}
          error={fieldErrors.password}
        />
        <p className="text-xs text-muted">
          8–16 characters, at least one uppercase letter and one special character.
        </p>

        <Button type="submit" loading={loading} className="w-full">
          <UserPlus size={16} />
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="focus-ring rounded font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
