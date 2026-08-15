const { body } = require('express-validator');
const { emailRule, addressRule } = require('./common');

const createStoreValidators = [
  body('name').trim().isLength({ min: 1, max: 60 }).withMessage('Store name must be at most 60 characters'),
  emailRule(),
  addressRule(),
  body('ownerId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Invalid owner id').toInt(),
];

module.exports = { createStoreValidators };
