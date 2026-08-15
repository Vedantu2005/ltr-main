const mysql = require('mysql2/promise');
const env = require('./env');

const dbConfig =
  process.env.MYSQL_URL || process.env.DATABASE_URL
    ? {
        uri: process.env.MYSQL_URL || process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        decimalNumbers: true,
      }
    : {
        host: env.db.host,
        port: env.db.port,
        user: env.db.user,
        password: env.db.password,
        database: env.db.name,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        decimalNumbers: true,
      };

const pool = mysql.createPool(dbConfig);

module.exports = pool;
