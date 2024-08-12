const { body, param, validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');

exports.validateQuestion = [
	body('text')
		.notEmpty().withMessage('Question text is required')
		.isString()
		.withMessage('Question text must be a string'),
	body('options')
		.isArray({ min: 2 }).withMessage('At least two options are required')
		.custom((options) => options.every((option) => typeof option === 'string'))
		.withMessage('All options must be strings'),
	body('correctAnswer')
		.isInt({ min: 0 }).withMessage('Correct answer must be a non-negative integer')
		.custom((value, { req }) => value < req.body.options.length)
		.withMessage('Correct answer index must be less than the number of options'),
	body('category')
		.notEmpty().withMessage('Category is required')
		.isString()
		.withMessage('Category must be a string'),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
		}
		return next();
	},
];

exports.validateQuestionId = [
	param('id').isMongoId().withMessage('Invalid question ID'),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
		}
		return next();
	},
];
