const ApiError = require('../utils/ApiError');
const { comparePassword, hashPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const userService = require('./user.service');

function sanitize(user) {
  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...safe } = user;
  return safe;
}

async function register({ name, email, password, address }) {
  const user = await userService.createUser({ name, email, password, address, role: 'USER' });
  const token = signToken(user);
  return { user: sanitize(user), token };
}

async function login({ email, password }) {
  const user = await userService.findByEmail(email);
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const matches = await comparePassword(password, user.password_hash);
  if (!matches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.status === 'SUSPENDED') {
    throw ApiError.forbidden('This account has been suspended');
  }

  const token = signToken(user);
  return { user: sanitize(user), token };
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await userService.findByIdWithHash(userId);
  const matches = await comparePassword(currentPassword, user.password_hash);
  if (!matches) {
    throw ApiError.badRequest('Current password is incorrect');
  }
  const newHash = await hashPassword(newPassword);
  await userService.updatePassword(userId, newHash);
}

module.exports = { register, login, changePassword, sanitize };
