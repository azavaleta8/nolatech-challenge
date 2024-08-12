const Evaluation = require('../models/Evaluation');
const Question = require('../models/Question');

const EvaluationService = {
	async createEvaluation(evaluationData) {
		const evaluation = await Evaluation.create(evaluationData);
		return evaluation;
	},

	async getAllEvaluations() {
		const evaluations = await Evaluation.find().populate('employeeId evaluatorId');
		return evaluations;
	},

	async getEvaluationById(id) {
		const evaluation = await Evaluation.findById(id).populate('employeeId evaluatorId');
		if (!evaluation) {
			throw new Error('Evaluation not found');
		}
		return evaluation;
	},

	async updateEvaluation(id, updateData) {
		const evaluation = await Evaluation.findByIdAndUpdate(id, updateData, { new: true });
		if (!evaluation) {
			throw new Error('Evaluation not found');
		}
		return evaluation;
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

		return evaluation;
	},
};

module.exports = EvaluationService;
