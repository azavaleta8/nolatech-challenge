const { StatusCodes } = require('http-status-codes');
const EvaluationService = require('../services/EvaluationService');

exports.createEvaluation = async (req, res, next) => {
	try {
		const evaluation = await EvaluationService.createEvaluation(req.body);
		res.status(StatusCodes.CREATED).json(evaluation);
	} catch (error) {
		next(error);
	}
};

exports.getAllEvaluations = async (req, res, next) => {
	try {
		const evaluations = await EvaluationService.getAllEvaluations();
		res.status(StatusCodes.OK).json(evaluations);
	} catch (error) {
		next(error);
	}
};

exports.getEvaluationById = async (req, res, next) => {
	try {
		const evaluation = await EvaluationService.getEvaluationById(req.params.id);
		res.status(StatusCodes.OK).json(evaluation);
	} catch (error) {
		if (error.message === 'Evaluation not found') {
			res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
		} else {
			next(error);
		}
	}
};

exports.updateEvaluation = async (req, res, next) => {
	try {
		const evaluation = await EvaluationService.updateEvaluation(req.params.id, req.body);
		res.status(StatusCodes.OK).json(evaluation);
	} catch (error) {
		if (error.message === 'Evaluation not found') {
			res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
		} else {
			next(error);
		}
	}
};

exports.deleteEvaluation = async (req, res, next) => {
	try {
		const result = await EvaluationService.deleteEvaluation(req.params.id);
		res.status(StatusCodes.OK).json(result);
	} catch (error) {
		if (error.message === 'Evaluation not found') {
			res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
		} else {
			next(error);
		}
	}
};

exports.submitEvaluation = async (req, res, next) => {
	try {
		const evaluation = await EvaluationService.submitEvaluation(req.params.id);
		res.status(StatusCodes.OK).json(evaluation);
	} catch (error) {
		if (error.message === 'Evaluation not found') {
			res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
		} else {
			next(error);
		}
	}
};
