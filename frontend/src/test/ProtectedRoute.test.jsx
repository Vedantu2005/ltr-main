import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute';

const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithRoute(initialPath = '/secret') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/secret" element={<div>Secret content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  test('shows a spinner while auth is initializing', () => {
    mockUseAuth.mockReturnValue({ user: null, initializing: true });
    const { container } = renderWithRoute();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('redirects to /login when there is no authenticated user', () => {
    mockUseAuth.mockReturnValue({ user: null, initializing: false });
    renderWithRoute();
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  test('renders the protected content when a user is authenticated', () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, role: 'USER' }, initializing: false });
    renderWithRoute();
    expect(screen.getByText('Secret content')).toBeInTheDocument();
  });
});
