const { body, param, query } = require('express-validator');

const nameRule = (field = 'name') =>
  body(field)
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters');

const emailRule = (field = 'email') => body(field).trim().isEmail().withMessage('A valid email is required').normalizeEmail();

const addressRule = (field = 'address') =>
  body(field)
    .trim()
    .isLength({ min: 1, max: 400 })
    .withMessage('Address is required and must be at most 400 characters');

const passwordRule = (field = 'password') =>
  body(field)
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>[\]\\/~`_+=;'-]/)
    .withMessage('Password must contain at least one special character');

const idParamRule = (field = 'id') => param(field).isInt({ min: 1 }).withMessage('Invalid id').toInt();

const ratingRule = (field = 'rating') =>
  body(field).isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5').toInt();

const paginationQueryRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = {
  nameRule,
  emailRule,
  addressRule,
  passwordRule,
  idParamRule,
  ratingRule,
  paginationQueryRules,
};
