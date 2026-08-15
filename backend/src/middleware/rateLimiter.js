const rateLimit = require('express-rate-limit');

// Applied only to /api/auth/* - generous enough for normal use/testing,
// tight enough to blunt credential-stuffing / brute force attempts.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later' },
});

module.exports = { authRateLimiter };
