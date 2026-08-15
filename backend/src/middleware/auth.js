const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt');

/**
 * Verifies the JWT and loads the current user from the database so
 * suspended/deleted accounts are rejected even with a still-valid token.
 * Role is always derived from this freshly-loaded row, never from the token
 * payload alone and never from the request body.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Authentication token missing');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Session expired, please log in again');
    }
    throw ApiError.unauthorized('Invalid authentication token');
  }

  const [rows] = await pool.execute(
    'SELECT id, name, email, address, role, status, created_at FROM users WHERE id = ? LIMIT 1',
    [payload.userId],
  );
  const user = rows[0];

  if (!user) {
    throw ApiError.unauthorized('Account no longer exists');
  }
  if (user.status === 'SUSPENDED') {
    throw ApiError.forbidden('This account has been suspended');
  }

  req.user = user;
  next();
});

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
