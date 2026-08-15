const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, address } = req.body;
  const result = await authService.register({ name, email, password, address });
  return success(res, { statusCode: 201, message: 'Registration successful', data: result });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return success(res, { message: 'Login successful', data: result });
});

const logout = asyncHandler(async (req, res) => {
  // Stateless JWTs: nothing to invalidate server-side, client discards the token.
  return success(res, { message: 'Logged out successfully' });
});

const me = asyncHandler(async (req, res) => {
  return success(res, { data: req.user });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  return success(res, { message: 'Password updated successfully' });
});

module.exports = { register, login, logout, me, changePassword };
