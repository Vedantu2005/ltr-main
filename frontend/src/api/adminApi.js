import client from './client';

export const getDashboard = () => client.get('/admin/dashboard').then((r) => r.data.data);

export const listUsers = (params) => client.get('/admin/users', { params }).then((r) => r.data);
export const createUser = (payload) => client.post('/admin/users', payload).then((r) => r.data.data);
export const getUserDetail = (id) => client.get(`/admin/users/${id}`).then((r) => r.data.data);
export const suspendUser = (id) =>
  client.patch(`/admin/users/${id}/suspend`).then((r) => r.data.data);
export const reactivateUser = (id) =>
  client.patch(`/admin/users/${id}/reactivate`).then((r) => r.data.data);

export const listStores = (params) => client.get('/admin/stores', { params }).then((r) => r.data);
export const createStore = (payload) => client.post('/admin/stores', payload).then((r) => r.data.data);
export const getStoreDetail = (id) => client.get(`/admin/stores/${id}`).then((r) => r.data.data);
