const request = require('supertest');
const app = require('../src/app');
const { createUser, VALID_PASSWORD } = require('./helpers/factories');

describe('Authentication', () => {
  const validRegistration = {
    name: 'Elizabeth Margaret Cunningham Rowe',
    email: 'elizabeth.rowe@example.com',
    password: 'StrongPass1!',
    address: '42 Cunningham Court, Rowetown, RT',
  };

  test('registers a new normal user', async () => {
    const res = await request(app).post('/api/auth/register').send(validRegistration);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('USER');
    expect(res.body.data.user.password_hash).toBeUndefined();
    expect(res.body.data.token).toEqual(expect.any(String));
  });

  test('rejects registration with an invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validRegistration, email: 'not-an-email' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('rejects registration with an invalid (too weak) password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validRegistration, password: 'weakpass' });
    expect(res.status).toBe(422);
  });

  test('logs in with correct credentials', async () => {
    await createUser({ email: 'login.target@example.com', password: VALID_PASSWORD });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login.target@example.com', password: VALID_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
  });

  test('rejects login with an invalid password', async () => {
    await createUser({ email: 'wrongpass@example.com', password: VALID_PASSWORD });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrongpass@example.com', password: 'TotallyWrong1!' });
    expect(res.status).toBe(401);
  });

  test('rejects login for a non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'DoesNotMatter1!' });
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me returns the authenticated user with a valid JWT', async () => {
    const { token, user } = await createUser();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(user.id);
  });

  test('GET /api/auth/me rejects a missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me rejects a malformed/invalid JWT', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not.a.valid.jwt');
    expect(res.status).toBe(401);
  });
});
