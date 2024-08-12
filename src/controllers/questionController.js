const { StatusCodes } = require('http-status-codes');
const QuestionService = require('../services/QuestionService');

exports.createQuestion = async (req, res, next) => {
	try {
		const question = await QuestionService.createQuestion(req.body);
		res.status(StatusCodes.CREATED).json(question);
	} catch (error) {
		next(error);
	}
};

exports.getAllQuestions = async (req, res, next) => {
	try {
		const questions = await QuestionService.getAllQuestions();
		res.status(StatusCodes.OK).json(questions);
	} catch (error) {
		next(error);
	}
};

exports.getQuestionById = async (req, res, next) => {
	try {
		const question = await QuestionService.getQuestionById(req.params.id);
		res.status(StatusCodes.OK).json(question);
	} catch (error) {
		if (error.message === 'Question not found') {
			res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
		} else {
			next(error);
		}
	}
};

exports.updateQuestion = async (req, res, next) => {
	try {
		const question = await QuestionService.updateQuestion(req.params.id, req.body);
		res.status(StatusCodes.OK).json(question);
	} catch (error) {
		if (error.message === 'Question not found') {
			res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
		} else {
			next(error);
		}
	}
};

exports.deleteQuestion = async (req, res, next) => {
	try {
		const result = await QuestionService.deleteQuestion(req.params.id);
		res.status(StatusCodes.OK).json(result);
	} catch (error) {
		if (error.message === 'Question not found') {
			res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
		} else {
			next(error);
		}
	}
};
