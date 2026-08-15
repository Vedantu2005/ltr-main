const request = require('supertest');
const app = require('../src/app');
const { createUser } = require('./helpers/factories');

describe('Security', () => {
  test('unauthenticated requests to protected routes are rejected', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
  });

  test('a malformed bearer token is rejected', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', 'Bearer this-is-not-a-jwt');
    expect(res.status).toBe(401);
  });

  test('a missing Bearer scheme is rejected', async () => {
    const { token } = await createUser({ role: 'ADMIN' });
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', token);
    expect(res.status).toBe(401);
  });

  test('a suspended user is blocked even with a previously-valid token', async () => {
    const { token, user } = await createUser({ role: 'USER' });
    const { token: adminToken } = await createUser({ role: 'ADMIN' });

    await request(app)
      .patch(`/api/admin/users/${user.id}/suspend`)
      .set('Authorization', `Bearer ${adminToken}`);

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('password_hash is never present in any API response', async () => {
    const { token } = await createUser({ role: 'ADMIN' });
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`);
    const serialized = JSON.stringify(res.body);
    expect(serialized).not.toMatch(/password_hash/i);
  });

  test('SQL-injection-shaped search input is treated as a literal string, not executed', async () => {
    const res = await request(app).get("/api/stores?search='; DROP TABLE stores; --");
    expect(res.status).toBe(200);
    // If injection worked, this second request would now fail because the table is gone.
    const followUp = await request(app).get('/api/stores');
    expect(followUp.status).toBe(200);
  });
});
