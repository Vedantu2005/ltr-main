import { useState } from 'react';
import * as adminApi from '../../api/adminApi';
import { extractErrorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { validateName, validateEmail, validateAddress, validatePassword } from '../../utils/validators';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const initialForm = { name: '', email: '', address: '', password: '', role: 'USER' };

export default function CreateUserModal({ open, onClose, onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const handleClose = () => {
    setForm(initialForm);
    setErrors({});
    onClose();
  };

  const validate = () => {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    };
    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await adminApi.createUser(form);
      toast.success(`${user.role === 'ADMIN' ? 'Admin' : user.role === 'STORE_OWNER' ? 'Store owner' : 'User'} created successfully.`);
      onCreated(user);
      handleClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add user">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input label="Full name" value={form.name} onChange={setField('name')} error={errors.name} />
        <Input label="Email" type="email" value={form.email} onChange={setField('email')} error={errors.email} />
        <Input label="Address" value={form.address} onChange={setField('address')} error={errors.address} />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={setField('password')}
          error={errors.password}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="role" className="text-sm font-medium text-foreground">
            Role
          </label>
          <select
            id="role"
            value={form.role}
            onChange={setField('role')}
            className="focus-ring rounded border border-border bg-surface px-3 py-2 text-sm text-foreground"
          >
            <option value="USER">Normal user</option>
            <option value="STORE_OWNER">Store owner</option>
            <option value="ADMIN">System administrator</option>
          </select>
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {loading ? 'Creating...' : 'Create user'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
