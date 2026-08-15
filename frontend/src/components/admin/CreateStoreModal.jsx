import { useEffect, useState } from 'react';
import * as adminApi from '../../api/adminApi';
import { extractErrorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { validateEmail, validateAddress } from '../../utils/validators';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const initialForm = { name: '', email: '', address: '', ownerId: '' };

export default function CreateStoreModal({ open, onClose, onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setOwnersLoading(true);
    adminApi
      .listUsers({ role: 'STORE_OWNER', limit: 100, sortBy: 'name', order: 'asc' })
      .then((res) => setOwners(res.data))
      .catch(() => setOwners([]))
      .finally(() => setOwnersLoading(false));
  }, [open]);

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const handleClose = () => {
    setForm(initialForm);
    setErrors({});
    onClose();
  };

  const validate = () => {
    const next = {
      name: form.name.trim().length ? null : 'Store name is required',
      email: validateEmail(form.email),
      address: validateAddress(form.address),
    };
    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const store = await adminApi.createStore({
        ...form,
        ownerId: form.ownerId ? Number(form.ownerId) : undefined,
      });
      toast.success('Store created successfully.');
      onCreated(store);
      handleClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add store">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input label="Store name" value={form.name} onChange={setField('name')} error={errors.name} />
        <Input label="Email" type="email" value={form.email} onChange={setField('email')} error={errors.email} />
        <Input label="Address" value={form.address} onChange={setField('address')} error={errors.address} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ownerId" className="text-sm font-medium text-foreground">
            Store owner (optional)
          </label>
          <select
            id="ownerId"
            value={form.ownerId}
            onChange={setField('ownerId')}
            disabled={ownersLoading}
            className="focus-ring rounded border border-border bg-surface px-3 py-2 text-sm text-foreground"
          >
            <option value="">No owner assigned</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.email})
              </option>
            ))}
          </select>
          {owners.length === 0 && !ownersLoading && (
            <p className="text-xs text-muted">
              No store-owner accounts exist yet. Create one from the Users page first.
            </p>
          )}
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {loading ? 'Creating...' : 'Create store'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
