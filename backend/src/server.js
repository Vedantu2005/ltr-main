const app = require('./app');
const env = require('./config/env');
const pool = require('./config/db');

async function checkDb() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('Connected to MySQL database:', env.db.name);
  } catch (err) {
    console.error('MySQL connection warning:', err.message);
  }
}

app.listen(env.port, '0.0.0.0', () => {
  console.log(`RateSphere API listening on port ${env.port} (${env.nodeEnv})`);
  checkDb();
});

