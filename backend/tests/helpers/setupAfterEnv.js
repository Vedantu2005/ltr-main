const { resetDb, closeDb } = require('./db');

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await closeDb();
});
