const app = require('./app');
const env = require('./config/env');
const pool = require('./config/db');

async function start() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('Connected to MySQL database:', env.db.name);
  } catch (err) {
    console.error('Failed to connect to MySQL:', err.message);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`RateSphere API listening on port ${env.port} (${env.nodeEnv})`);
  });
}

start();
