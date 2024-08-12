const { body, param, validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');

exports.validateEvaluation = [
	body('employeeId')
		.notEmpty().withMessage('Employee ID is required')
		.isMongoId()
		.withMessage('Invalid Employee ID'),
	body('evaluatorId')
		.notEmpty().withMessage('Evaluator ID is required')
		.isMongoId()
		.withMessage('Invalid Evaluator ID'),
	body('period')
		.notEmpty().withMessage('Period is required')
		.isString()
		.withMessage('Period must be a string'),
	body('questions')
		.isArray({ min: 1 }).withMessage('At least one question is required')
		.custom((questions) => questions.every((q) => mongoose.Types.ObjectId.isValid(q.questionId)
        && (q.answer === undefined || typeof q.answer === 'number')))
		.withMessage('Invalid question format'),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
		}
		return next();
	},
];

exports.validateEvaluationId = [
	param('id').isMongoId().withMessage('Invalid evaluation ID'),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
		}
		return next();
	},
];
