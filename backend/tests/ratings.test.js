const request = require('supertest');
const app = require('../src/app');
const { createUser, createStore } = require('./helpers/factories');

describe('Ratings', () => {
  test('accepts a rating of 1-5', async () => {
    const { token } = await createUser({ role: 'USER' });
    const store = await createStore();

    for (const value of [1, 2, 3, 4, 5]) {
      const res = await request(app)
        .post(`/api/stores/${store.id}/ratings`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: value });
      expect(res.status).toBe(200);
      expect(res.body.data.rating).toBe(value);
    }
  });

  test('rejects a rating of 0', async () => {
    const { token } = await createUser({ role: 'USER' });
    const store = await createStore();
    const res = await request(app)
      .post(`/api/stores/${store.id}/ratings`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 0 });
    expect(res.status).toBe(422);
  });

  test('rejects a rating of 6', async () => {
    const { token } = await createUser({ role: 'USER' });
    const store = await createStore();
    const res = await request(app)
      .post(`/api/stores/${store.id}/ratings`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 6 });
    expect(res.status).toBe(422);
  });

  test('resubmitting a rating updates the existing row instead of creating a duplicate', async () => {
    const { token } = await createUser({ role: 'USER' });
    const store = await createStore();

    await request(app)
      .post(`/api/stores/${store.id}/ratings`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 2 });
    const second = await request(app)
      .post(`/api/stores/${store.id}/ratings`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5 });

    expect(second.status).toBe(200);

    const detail = await request(app).get(`/api/stores/${store.id}`);
    expect(detail.body.data.totalRatings).toBe(1);
    expect(detail.body.data.averageRating).toBe(5);
  });

  test('average rating is recalculated correctly across multiple raters', async () => {
    const { token: token1 } = await createUser({ role: 'USER' });
    const { token: token2 } = await createUser({ role: 'USER' });
    const store = await createStore();

    await request(app)
      .post(`/api/stores/${store.id}/ratings`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ rating: 2 });
    await request(app)
      .post(`/api/stores/${store.id}/ratings`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ rating: 4 });

    const detail = await request(app).get(`/api/stores/${store.id}`);
    expect(detail.body.data.totalRatings).toBe(2);
    expect(detail.body.data.averageRating).toBe(3);
  });

  test('rejects rating a store that does not exist', async () => {
    const { token } = await createUser({ role: 'USER' });
    const res = await request(app)
      .post('/api/stores/999999/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 3 });
    expect(res.status).toBe(404);
  });

  test('rejects an unauthenticated rating submission', async () => {
    const store = await createStore();
    const res = await request(app).post(`/api/stores/${store.id}/ratings`).send({ rating: 3 });
    expect(res.status).toBe(401);
  });
});
