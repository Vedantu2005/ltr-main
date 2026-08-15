require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    name:
      process.env.NODE_ENV === 'test'
        ? process.env.TEST_DB_NAME || 'ratesphere_test'
        : process.env.DB_NAME || 'ratesphere',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'ratesphere_production_secret_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
};

module.exports = env;
