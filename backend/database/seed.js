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
      'Aarav Rajesh Sharma Administrator',
      'admin@ratesphere.dev',
      passwordHash,
      'Flat 402, Shanti Niketan Apartments, MG Road, Bengaluru, Karnataka',
      'ADMIN',
      'ACTIVE',
    ],
  );
  console.log(`  created admin #${adminResult.insertId}`);

  // --- Normal users ----------------------------------------------------------
  const normalUsers = [
    ['Aarav Rajesh Kumar Sharma', 'aarav.sharma@example.in', '42 Indiranagar 100ft Road, Bengaluru, Karnataka'],
    ['Priya Lakshmi Venkataraman', 'priya.venkataraman@example.in', '15 Anna Nagar West, Chennai, Tamil Nadu'],
    ['Rohan Devendra Mukherjee', 'rohan.mukherjee@example.in', '88 Salt Lake Sector V, Kolkata, West Bengal'],
    ['Ananya Sneha Deshmukh Joshi', 'ananya.deshmukh@example.in', '12 FC Road, Shivajinagar, Pune, Maharashtra'],
    ['Kavya Rajeshwari Sundaram', 'kavya.sundaram@example.in', '74 Jubilee Hills Road No 36, Hyderabad, Telangana'],
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
    ['Rajesh Kumar Rajeshwar Varma', 'rajesh.varma@example.in', '102 Connaught Place Outer Ring, New Delhi, Delhi'],
    ['Sunita Manisha Choudhury Roy', 'sunita.choudhury@example.in', '56 Park Street Heritage Zone, Kolkata, West Bengal'],
    ['Amitabh Harishchandra Patel', 'amitabh.patel@example.in', '90 CG Road, Navrangpura, Ahmedabad, Gujarat'],
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
    ['Chai Point & Royal Spices Hub', 'orders@royalspices.example.in', '102 Connaught Place Outer Ring, New Delhi, Delhi', ownerIds[0]],
    ['FabIndia Heritage Silks & Crafts', 'contact@heritagesilks.example.in', '56 Park Street Heritage Zone, Kolkata, West Bengal', ownerIds[1]],
    ['Patel Sweets & Savouries Emporium', 'info@patelsweets.example.in', '90 CG Road, Navrangpura, Ahmedabad, Gujarat', ownerIds[2]],
    ['Chai Point & Royal Spices Express', 'express@royalspices.example.in', '15 Cyber City Cyber Hub, Gurugram, Haryana', ownerIds[0]],
    ['Sapna Heritage Book House India', 'books@sapnabookhouse.example.in', '24 Brigade Road Commercial Center, Bengaluru, Karnataka', null],
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
  console.log('  aarav.sharma@example.in         (USER)');
  console.log('  rajesh.varma@example.in         (STORE_OWNER)');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
