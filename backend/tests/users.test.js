const request = require('supertest');
const app = require('../src/app');
const { createUser } = require('./helpers/factories');

describe('Admin user management', () => {
  const validNewUser = {
    name: 'Frederick Alexander Montgomery Holt',
    email: 'frederick.holt@example.com',
    password: 'AdminMade1!',
    address: '9 Montgomery Row, Holtville, HV',
    role: 'USER',
  };

  test('admin can create a user', async () => {
    const { token } = await createUser({ role: 'ADMIN' });
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send(validNewUser);
    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe(validNewUser.email);
  });

  test('admin can create another admin', async () => {
    const { token } = await createUser({ role: 'ADMIN' });
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validNewUser, email: 'second.admin@example.com', role: 'ADMIN' });
    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('ADMIN');
  });

  test('rejects duplicate email', async () => {
    const { token } = await createUser({ role: 'ADMIN' });
    await createUser({ email: 'taken@example.com' });
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validNewUser, email: 'taken@example.com' });
    expect(res.status).toBe(409);
  });

  test('rejects invalid input (name too short)', async () => {
    const { token } = await createUser({ role: 'ADMIN' });
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validNewUser, email: 'shortname@example.com', name: 'Too Short' });
    expect(res.status).toBe(422);
  });

  test('rejects invalid role value', async () => {
    const { token } = await createUser({ role: 'ADMIN' });
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validNewUser, email: 'badrole@example.com', role: 'SUPERUSER' });
    expect(res.status).toBe(422);
  });

  test('lists users with pagination metadata', async () => {
    const { token } = await createUser({ role: 'ADMIN' });
    await createUser();
    await createUser();
    const res = await request(app)
      .get('/api/admin/users?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 2 });
    expect(res.body.data.length).toBeLessThanOrEqual(2);
  });

  test('suspend then reactivate a user changes their status and blocks/unblocks login', async () => {
    const { token: adminToken } = await createUser({ role: 'ADMIN' });
    const { user, token: _unused } = await createUser({
      email: 'suspendme@example.com',
      password: 'SuspendMe1!',
    });
    void _unused;

    const suspendRes = await request(app)
      .patch(`/api/admin/users/${user.id}/suspend`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(suspendRes.status).toBe(200);
    expect(suspendRes.body.data.status).toBe('SUSPENDED');

    const blockedLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'suspendme@example.com', password: 'SuspendMe1!' });
    expect(blockedLogin.status).toBe(403);

    const reactivateRes = await request(app)
      .patch(`/api/admin/users/${user.id}/reactivate`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(reactivateRes.status).toBe(200);
    expect(reactivateRes.body.data.status).toBe('ACTIVE');

    const allowedLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'suspendme@example.com', password: 'SuspendMe1!' });
    expect(allowedLogin.status).toBe(200);
  });
});
