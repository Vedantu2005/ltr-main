const pool = require('../config/db');

/**
 * All figures are computed live from the database on every request - none
 * of this is cached or hardcoded.
 */
async function getAdminDashboard() {
  const [[userStats]] = await pool.query(
    `SELECT
       COUNT(*) AS totalUsers,
       SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS activeUsers,
       SUM(CASE WHEN status = 'SUSPENDED' THEN 1 ELSE 0 END) AS suspendedUsers
     FROM users`,
  );
  const [[storeStats]] = await pool.query('SELECT COUNT(*) AS totalStores FROM stores');
  const [[ratingStats]] = await pool.query(
    'SELECT COUNT(*) AS totalRatings, ROUND(AVG(rating), 2) AS averagePlatformRating FROM ratings',
  );

  return {
    totalUsers: userStats.totalUsers,
    activeUsers: userStats.activeUsers,
    suspendedUsers: userStats.suspendedUsers,
    totalStores: storeStats.totalStores,
    totalRatings: ratingStats.totalRatings,
    averagePlatformRating:
      ratingStats.averagePlatformRating !== null ? Number(ratingStats.averagePlatformRating) : null,
  };
}

module.exports = { getAdminDashboard };
