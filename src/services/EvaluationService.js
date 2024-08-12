const Evaluation = require('../models/Evaluation');
const Question = require('../models/Question');

function sanitizeEvaluation(evaluation) {
	const {
		_id, employeeId, evaluatorId, period, status, questions, score,
	} = evaluation;
	return {
		id: _id, employeeId, evaluatorId, period, status, questions, score,
	};
}

const EvaluationService = {
	async createEvaluation(evaluationData) {
		const evaluation = await Evaluation.create(evaluationData);
		return sanitizeEvaluation(evaluation);
	},

	async getAllEvaluations() {
		const evaluations = await Evaluation.find();
		return evaluations.map(sanitizeEvaluation);
	},

	async getEvaluationById(id) {
		const evaluation = await Evaluation.findById(id);
		if (!evaluation) {
			throw new Error('Evaluation not found');
		}
		return sanitizeEvaluation(evaluation);
	},

	async updateEvaluation(id, updateData) {
		const evaluation = await Evaluation.findByIdAndUpdate(id, updateData, { new: true });
		if (!evaluation) {
			throw new Error('Evaluation not found');
		}
		return sanitizeEvaluation(evaluation);
	},

	async deleteEvaluation(id) {
		const evaluation = await Evaluation.findByIdAndDelete(id);
		if (!evaluation) {
			throw new Error('Evaluation not found');
		}
		return { message: 'Evaluation deleted successfully' };
	},

	async submitEvaluation(id) {
		const evaluation = await Evaluation.findById(id);
		if (!evaluation) {
			throw new Error('Evaluation not found');
		}

		const { questions } = evaluation;

		const scorePromises = questions.map(async (questionData) => {
			const question = await Question.findById(questionData.questionId);
			return question.correctAnswer === questionData.answers ? 1 : 0;
		});

		const scores = await Promise.all(scorePromises);
		const score = scores.reduce((sum, value) => sum + value, 0);

		evaluation.score = (score / questions.length) * 100;
		evaluation.status = 'completed';
		await evaluation.save();

		return sanitizeEvaluation(evaluation);
	},
};

module.exports = EvaluationService;
