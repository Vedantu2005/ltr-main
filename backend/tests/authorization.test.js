const request = require('supertest');
const app = require('../src/app');
const { createUser } = require('./helpers/factories');

describe('Authorization (RBAC)', () => {
  test('a normal USER cannot access admin endpoints', async () => {
    const { token } = await createUser({ role: 'USER' });
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('a STORE_OWNER cannot access admin endpoints', async () => {
    const { token } = await createUser({ role: 'STORE_OWNER' });
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('an ADMIN can access admin endpoints', async () => {
    const { token } = await createUser({ role: 'ADMIN' });
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalUsers');
  });

  test('a normal USER cannot access the store-owner dashboard', async () => {
    const { token } = await createUser({ role: 'USER' });
    const res = await request(app)
      .get('/api/store-owner/dashboard')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('a normal USER cannot submit a rating below 1 or above 5, regardless of store existence', async () => {
    const { token } = await createUser({ role: 'USER' });
    const res = await request(app)
      .post('/api/stores/999999/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 0 });
    expect(res.status).toBe(422);
  });
});
