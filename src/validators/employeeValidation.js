const { body, param, validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');

const validateEmployee = [
	body('email').isEmail().withMessage('Invalid email'),
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
	body('role').isIn(['employee']).withMessage('Invalid role'),
	body('firstName').notEmpty().withMessage('First name is required'),
	body('lastName').notEmpty().withMessage('Last name is required'),
	body('position').notEmpty().withMessage('Position is required'),
	body('department').notEmpty().withMessage('Department is required'),
	body('hireDate').isISO8601().toDate().withMessage('Invalid hire date'),
	body('managerId').optional().isMongoId().withMessage('Invalid manager ID'),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
		}
		return next();
	},
];

const validateUserId = [
	param('id').isMongoId(),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
		}
		return next();
	},
];

module.exports = {
	validateEmployee,
	validateUserId,
};
