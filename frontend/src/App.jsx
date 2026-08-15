import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PageSpinner from './components/ui/PageSpinner';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminUserDetail from './pages/admin/UserDetail';
import AdminStores from './pages/admin/Stores';

import StoreList from './pages/user/StoreList';
import StoreDetail from './pages/user/StoreDetail';

import StoreOwnerDashboard from './pages/storeOwner/Dashboard';

const ROLE_HOME = { ADMIN: '/admin', USER: '/stores', STORE_OWNER: '/store-owner' };

function RoleHomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
}

export default function App() {
  const { initializing } = useAuth();

  if (initializing) return <PageSpinner />;

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<RoleHomeRedirect />} />
          <Route path="/profile" element={<Profile />} />

          <Route element={<RoleRoute roles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/:id" element={<AdminUserDetail />} />
            <Route path="/admin/stores" element={<AdminStores />} />
          </Route>

          <Route element={<RoleRoute roles={['USER']} />}>
            <Route path="/stores" element={<StoreList />} />
            <Route path="/stores/:id" element={<StoreDetail />} />
          </Route>

          <Route element={<RoleRoute roles={['STORE_OWNER']} />}>
            <Route path="/store-owner" element={<StoreOwnerDashboard />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
