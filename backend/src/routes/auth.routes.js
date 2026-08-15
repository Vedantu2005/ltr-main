const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { validateRequest } = require('../middleware/errorHandler');
const {
  registerValidators,
  loginValidators,
  changePasswordValidators,
} = require('../validators/auth.validators');

const router = express.Router();

router.post('/register', authRateLimiter, registerValidators, validateRequest, authController.register);
router.post('/login', authRateLimiter, loginValidators, validateRequest, authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.put(
  '/change-password',
  authenticate,
  changePasswordValidators,
  validateRequest,
  authController.changePassword,
);

module.exports = router;
