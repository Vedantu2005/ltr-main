const request = require('supertest');
const app = require('../src/app');
const { createUser } = require('./helpers/factories');

describe('Store management', () => {
  test('admin can create a store with a valid STORE_OWNER owner', async () => {
    const { token } = await createUser({ role: 'ADMIN' });
    const { user: owner } = await createUser({ role: 'STORE_OWNER' });

    const res = await request(app)
      .post('/api/admin/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'The Test Emporium',
        email: 'contact@testemporium.example.com',
        address: '10 Emporium Way',
        ownerId: owner.id,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.ownerId).toBe(owner.id);
  });

  test('rejects a store owner assignment when the user is not a STORE_OWNER', async () => {
    const { token } = await createUser({ role: 'ADMIN' });
    const { user: normalUser } = await createUser({ role: 'USER' });

    const res = await request(app)
      .post('/api/admin/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Invalid Owner Store',
        email: 'contact@invalidowner.example.com',
        address: '20 Invalid Ave',
        ownerId: normalUser.id,
      });

    expect(res.status).toBe(400);
  });

  test('allows a store to be created without an owner', async () => {
    const { token } = await createUser({ role: 'ADMIN' });
    const res = await request(app)
      .post('/api/admin/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ownerless Store', email: 'nobody@example.com', address: '30 Empty St' });
    expect(res.status).toBe(201);
    expect(res.body.data.ownerId).toBeNull();
  });

  test('public store listing returns computed average rating and pagination', async () => {
    const { token: adminToken } = await createUser({ role: 'ADMIN' });
    await request(app)
      .post('/api/admin/stores')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Listed Store', email: 'listed@example.com', address: '40 List Ln' });

    const res = await request(app).get('/api/stores');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.data[0]).toHaveProperty('averageRating');
  });

  test('store listing supports search by name', async () => {
    const { token: adminToken } = await createUser({ role: 'ADMIN' });
    await request(app)
      .post('/api/admin/stores')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Findable Bakery', email: 'bakery@example.com', address: '1 Flour St' });
    await request(app)
      .post('/api/admin/stores')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Other Shop', email: 'other@example.com', address: '2 Other St' });

    const res = await request(app).get('/api/stores?search=Bakery');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Findable Bakery');
  });
});
