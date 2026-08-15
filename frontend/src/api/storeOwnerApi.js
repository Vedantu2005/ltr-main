import client from './client';

export const getDashboard = () => client.get('/store-owner/dashboard').then((r) => r.data.data);
