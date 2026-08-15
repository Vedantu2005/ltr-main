const pool = require('./db');
const bcrypt = require('bcrypt');

async function autoInitDb() {
  try {
    // 1. Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role ENUM('ADMIN', 'USER', 'STORE_OWNER') NOT NULL DEFAULT 'USER',
        status ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT uq_users_email UNIQUE (email)
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        owner_id INT UNSIGNED NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_stores_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        store_id INT UNSIGNED NOT NULL,
        rating TINYINT UNSIGNED NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_ratings_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE CASCADE,
        CONSTRAINT uq_ratings_user_store UNIQUE (user_id, store_id)
      ) ENGINE=InnoDB;
    `);

    // 2. Check if admin user exists
    const [rows] = await pool.query('SELECT id FROM users LIMIT 1');
    if (rows.length === 0) {
      console.log('Database tables empty. Auto-seeding initial development accounts...');
      const passwordHash = await bcrypt.hash('DevPass123!', 12);

      // Admin
      await pool.query(
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

      // Normal users
      const normalUsers = [
        ['Aarav Rajesh Kumar Sharma', 'aarav.sharma@example.in', '42 Indiranagar 100ft Road, Bengaluru, Karnataka'],
        ['Priya Lakshmi Venkataraman', 'priya.venkataraman@example.in', '15 Anna Nagar West, Chennai, Tamil Nadu'],
        ['Rohan Devendra Mukherjee', 'rohan.mukherjee@example.in', '88 Salt Lake Sector V, Kolkata, West Bengal'],
        ['Ananya Sneha Deshmukh Joshi', 'ananya.deshmukh@example.in', '12 FC Road, Shivajinagar, Pune, Maharashtra'],
        ['Kavya Rajeshwari Sundaram', 'kavya.sundaram@example.in', '74 Jubilee Hills Road No 36, Hyderabad, Telangana'],
      ];
      const userIds = [];
      for (const [name, email, address] of normalUsers) {
        const [res] = await pool.query(
          'INSERT INTO users (name, email, password_hash, address, role, status) VALUES (?, ?, ?, ?, ?, ?)',
          [name, email, passwordHash, address, 'USER', 'ACTIVE'],
        );
        userIds.push(res.insertId);
      }

      // Store owners
      const storeOwners = [
        ['Rajesh Kumar Rajeshwar Varma', 'rajesh.varma@example.in', '102 Connaught Place Outer Ring, New Delhi, Delhi'],
        ['Sunita Manisha Choudhury Roy', 'sunita.choudhury@example.in', '56 Park Street Heritage Zone, Kolkata, West Bengal'],
        ['Amitabh Harishchandra Patel', 'amitabh.patel@example.in', '90 CG Road, Navrangpura, Ahmedabad, Gujarat'],
      ];
      const ownerIds = [];
      for (const [name, email, address] of storeOwners) {
        const [res] = await pool.query(
          'INSERT INTO users (name, email, password_hash, address, role, status) VALUES (?, ?, ?, ?, ?, ?)',
          [name, email, passwordHash, address, 'STORE_OWNER', 'ACTIVE'],
        );
        ownerIds.push(res.insertId);
      }

      // Stores
      const stores = [
        ['Chai Point & Royal Spices Hub', 'orders@royalspices.example.in', '102 Connaught Place Outer Ring, New Delhi, Delhi', ownerIds[0]],
        ['FabIndia Heritage Silks & Crafts', 'contact@heritagesilks.example.in', '56 Park Street Heritage Zone, Kolkata, West Bengal', ownerIds[1]],
        ['Patel Sweets & Savouries Emporium', 'info@patelsweets.example.in', '90 CG Road, Navrangpura, Ahmedabad, Gujarat', ownerIds[2]],
        ['Chai Point & Royal Spices Express', 'express@royalspices.example.in', '15 Cyber City Cyber Hub, Gurugram, Haryana', ownerIds[0]],
        ['Sapna Heritage Book House India', 'books@sapnabookhouse.example.in', '24 Brigade Road Commercial Center, Bengaluru, Karnataka', null],
      ];
      const storeIds = [];
      for (const [name, email, address, ownerId] of stores) {
        const [res] = await pool.query(
          'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
          [name, email, address, ownerId],
        );
        storeIds.push(res.insertId);
      }

      // Ratings
      const raterPool = [...userIds, ...ownerIds.filter((_, i) => i !== 0)];
      let ratingSeed = 3;
      for (const storeId of storeIds) {
        for (const raterId of raterPool) {
          ratingSeed = (ratingSeed * 7 + 5) % 5;
          const value = ratingSeed + 1;
          await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [raterId, storeId, value]);
        }
      }
      console.log('Database auto-initialization complete.');
    }
  } catch (err) {
    console.error('Auto-initialization notice:', err.message);
  }
}

module.exports = autoInitDb;
