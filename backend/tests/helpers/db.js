const pool = require('../../src/config/db');

async function resetDb() {
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  await pool.query('TRUNCATE TABLE ratings');
  await pool.query('TRUNCATE TABLE stores');
  await pool.query('TRUNCATE TABLE users');
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');
}

async function closeDb() {
  await pool.end();
}

module.exports = { resetDb, closeDb };
