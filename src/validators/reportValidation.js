const { param, validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');

exports.validateEmployeeId = [
	param('id').isMongoId().withMessage('Invalid employee ID'),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
		}
		return next();
	},
];

exports.validateDepartment = [
	param('department').notEmpty().withMessage('Department is required'),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
		}
		return next();
	},
];
