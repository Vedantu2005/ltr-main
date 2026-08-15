import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/auth/Login';

const mockLogin = vi.fn();
const mockToastSuccess = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ success: mockToastSuccess, error: vi.fn() }),
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
}

describe('Login form', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockToastSuccess.mockReset();
  });

  test('submits email and password to the login handler', async () => {
    mockLogin.mockResolvedValue({ name: 'Jane Doe', role: 'USER' });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'CorrectPass1!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('jane@example.com', 'CorrectPass1!');
    });
  });

  test('displays a server error message when login fails', async () => {
    mockLogin.mockRejectedValue({ response: { data: { message: 'Invalid email or password' } } });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'WrongPass1!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });
});
