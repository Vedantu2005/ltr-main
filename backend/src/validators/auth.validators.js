const { body } = require('express-validator');
const { nameRule, emailRule, addressRule, passwordRule } = require('./common');

const registerValidators = [nameRule(), emailRule(), addressRule(), passwordRule()];

const loginValidators = [
  emailRule(),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordValidators = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordRule('newPassword'),
];

module.exports = { registerValidators, loginValidators, changePasswordValidators };
