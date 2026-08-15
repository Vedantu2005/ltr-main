const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    const body = { success: false, message: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'A record with these details already exists' });
  }

  if (env.nodeEnv !== 'production') {
    console.error(err);
  } else {
    console.error(err.message);
  }

  return res.status(500).json({ success: false, message: 'Internal server error' });
}

/**
 * Runs after an express-validator chain and converts failures into a 422 ApiError.
 */
function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(ApiError.unprocessable('Validation failed', result.array({ onlyFirstError: true })));
  }
  return next();
}

module.exports = { notFoundHandler, errorHandler, validateRequest };
