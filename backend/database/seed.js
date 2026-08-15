/**
 * Seeds the ratesphere database with realistic, fictional development data:
 * 1 admin, 5 normal users, 3 store owners, 5 stores, 20+ ratings.
 * Passwords are hashed with real bcrypt (never stored as plaintext SQL).
 *
 * Usage: npm run seed   (reads DB_* vars from backend/.env)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
const DEV_PASSWORD = 'DevPass123!';

async function hash(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ratesphere',
    multipleStatements: false,
  });

  console.log(`Seeding database "${process.env.DB_NAME || 'ratesphere'}"...`);

  // Wipe existing data (dev only) - children first to respect FKs.
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  await connection.query('TRUNCATE TABLE ratings');
  await connection.query('TRUNCATE TABLE stores');
  await connection.query('TRUNCATE TABLE users');
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');

  const passwordHash = await hash(DEV_PASSWORD);

  // --- Admin ---------------------------------------------------------------
  const [adminResult] = await connection.query(
    'INSERT INTO users (name, email, password_hash, address, role, status) VALUES (?, ?, ?, ?, ?, ?)',
    [
      'Alexandra Whitfield Administrator',
      'admin@ratesphere.dev',
      passwordHash,
      '100 Harbor Administration Plaza, Suite 400, Portland, OR',
      'ADMIN',
      'ACTIVE',
    ],
  );
  console.log(`  created admin #${adminResult.insertId}`);

  // --- Normal users ----------------------------------------------------------
  const normalUsers = [
    ['Marcus Thomas Rodriguez Junior', 'marcus.rodriguez@example.com', '221 Baker Street, Chicago, IL'],
    ['Priya Lakshmi Venkataraman', 'priya.venkataraman@example.com', '48 Willow Grove Lane, Austin, TX'],
    ['Benjamin Alexander Whitmore', 'ben.whitmore@example.com', '9 Cedarwood Court, Denver, CO'],
    ['Sofia Isabella Castellanos', 'sofia.castellanos@example.com', '73 Riverside Drive, Miami, FL'],
    ['Nathaniel Oliver Higginbotham', 'nathaniel.higgs@example.com', '15 Fairview Terrace, Seattle, WA'],
  ];
  const userIds = [];
  for (const [name, email, address] of normalUsers) {
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password_hash, address, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, address, 'USER', 'ACTIVE'],
    );
    userIds.push(result.insertId);
  }
  console.log(`  created ${userIds.length} normal users`);

  // --- Store owners ----------------------------------------------------------
  const storeOwners = [
    ['Gabriella Marie Sinclair-Osei', 'gabriella.sinclair@example.com', '300 Market Street, San Francisco, CA'],
    ['Theodore James Kowalczyk', 'theo.kowalczyk@example.com', '55 Elm Grove Avenue, Boston, MA'],
    ['Amara Nkechi Adebayo-Fitzgerald', 'amara.adebayo@example.com', '128 Sunset Boulevard, Los Angeles, CA'],
  ];
  const ownerIds = [];
  for (const [name, email, address] of storeOwners) {
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password_hash, address, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, address, 'STORE_OWNER', 'ACTIVE'],
    );
    ownerIds.push(result.insertId);
  }
  console.log(`  created ${ownerIds.length} store owners`);

  // --- Stores ------------------------------------------------------------
  const stores = [
    ['Northbound Coffee Roasters', 'hello@northboundcoffee.example.com', '300 Market Street, San Francisco, CA', ownerIds[0]],
    ['Kowalczyk Hardware & Supply', 'contact@kowalczykhardware.example.com', '55 Elm Grove Avenue, Boston, MA', ownerIds[1]],
    ['Adebayo Fine Fabrics', 'orders@adebayofabrics.example.com', '128 Sunset Boulevard, Los Angeles, CA', ownerIds[2]],
    ['Northbound Coffee Roasters - Downtown', 'downtown@northboundcoffee.example.com', '42 Pine Street, San Francisco, CA', ownerIds[0]],
    ['Riverside Book Exchange', 'info@riversidebooks.example.com', '18 Riverside Drive, Miami, FL', null],
  ];
  const storeIds = [];
  for (const [name, email, address, ownerId] of stores) {
    const [result] = await connection.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, ownerId],
    );
    storeIds.push(result.insertId);
  }
  console.log(`  created ${storeIds.length} stores`);

  // --- Ratings (20+, spread across users/stores, no duplicate user+store pairs) --
  const raterPool = [...userIds, ...ownerIds.filter((_, i) => i !== 0)]; // owners can rate stores they don't own
  const ratings = [];
  let ratingSeed = 3;
  for (const storeId of storeIds) {
    for (const raterId of raterPool) {
      // Deterministic pseudo-random 1-5 rating so results are reproducible.
      ratingSeed = (ratingSeed * 7 + 5) % 5;
      const value = ratingSeed + 1;
      ratings.push([raterId, storeId, value]);
    }
  }

  let insertedRatings = 0;
  for (const [userId, storeId, value] of ratings) {
    await connection.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
      [userId, storeId, value],
    );
    insertedRatings += 1;
  }
  console.log(`  created ${insertedRatings} ratings`);

  await connection.end();
  console.log('Seed complete.');
  console.log('');
  console.log('Development credentials (password for ALL seeded accounts):');
  console.log(`  password: ${DEV_PASSWORD}`);
  console.log('  admin@ratesphere.dev            (ADMIN)');
  console.log('  marcus.rodriguez@example.com    (USER)');
  console.log('  gabriella.sinclair@example.com  (STORE_OWNER)');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
