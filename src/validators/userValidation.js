const { body, param, validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');

const validateRegistration = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').trim().isLength({ min: 6 }),
  body('role').trim().isIn(['admin', 'manager']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
    }
    next();
  }
];

const validateLogin = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').trim().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
    }
    next();
  }
];

const validateUserId = [
  param('id').isMongoId(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateUserId
};