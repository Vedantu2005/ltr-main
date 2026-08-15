const { body } = require('express-validator');
const { nameRule, emailRule, addressRule, passwordRule } = require('./common');

const createUserValidators = [
  nameRule(),
  emailRule(),
  addressRule(),
  passwordRule(),
  body('role')
    .isIn(['ADMIN', 'USER', 'STORE_OWNER'])
    .withMessage('Role must be one of ADMIN, USER, STORE_OWNER'),
];

module.exports = { createUserValidators };
