const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

/**
 * Upserts a rating for (userId, storeId). The UNIQUE(user_id, store_id)
 * constraint guarantees a user can only ever have one row per store -
 * resubmitting updates the existing rating instead of creating a duplicate.
 */
async function submitRating({ userId, storeId, rating }) {
  const [storeRows] = await pool.execute('SELECT id FROM stores WHERE id = ? LIMIT 1', [storeId]);
  if (!storeRows[0]) {
    throw ApiError.notFound('Store not found');
  }

  await pool.execute(
    `INSERT INTO ratings (user_id, store_id, rating)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
    [userId, storeId, rating],
  );

  const [rows] = await pool.execute(
    'SELECT id, user_id AS userId, store_id AS storeId, rating, created_at AS createdAt, updated_at AS updatedAt FROM ratings WHERE user_id = ? AND store_id = ?',
    [userId, storeId],
  );
  return rows[0];
}

module.exports = { submitRating };
