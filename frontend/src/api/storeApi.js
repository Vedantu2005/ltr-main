import client from './client';

export const listStores = (params) => client.get('/stores', { params }).then((r) => r.data);
export const getStore = (id) => client.get(`/stores/${id}`).then((r) => r.data.data);
export const submitRating = (storeId, rating) =>
  client.post(`/stores/${storeId}/ratings`, { rating }).then((r) => r.data.data);
