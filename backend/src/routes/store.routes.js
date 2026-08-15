const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { verifyToken } = require('../utils/jwt');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const { idParamRule, ratingRule } = require('../validators/common');
const storeController = require('../controllers/store.controller');

const router = express.Router();

/**
 * Store browsing is public, but if a valid token is present we attach
 * req.user so listings can include "my rating" for the current viewer.
 * Unlike `authenticate`, a missing/invalid token here is not an error.
 */
async function attachViewerIfPresent(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next();
  }
  try {
    const payload = verifyToken(token);
    const [rows] = await pool.execute(
      'SELECT id, name, email, address, role, status FROM users WHERE id = ? LIMIT 1',
      [payload.userId],
    );
    if (rows[0] && rows[0].status === 'ACTIVE') {
      req.user = rows[0];
    }
  } catch (err) {
    if (!(err instanceof jwt.JsonWebTokenError)) throw err;
  }
  return next();
}

router.get('/', attachViewerIfPresent, storeController.listStores);
router.get('/:id', idParamRule(), validateRequest, attachViewerIfPresent, storeController.getStore);
router.post(
  '/:id/ratings',
  authenticate,
  authorize('USER'),
  idParamRule(),
  ratingRule(),
  validateRequest,
  storeController.submitRating,
);

module.exports = router;
