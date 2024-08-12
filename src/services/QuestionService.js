const Question = require('../models/Question');

function sanitizeQuestion(question) {
	const {
		_id, category, correctAnswer, options, text,
	} = question;
	return {
		id: _id, category, correctAnswer, options, text,
	};
}

const QuestionService = {
	async createQuestion(questionData) {
		const question = await Question.create(questionData);
		return sanitizeQuestion(question);
	},

	async getAllQuestions() {
		const questions = await Question.find();
		return questions.map((q) => sanitizeQuestion(q));
	},

	async getQuestionById(id) {
		const question = await Question.findById(id);
		if (!question) {
			throw new Error('Question not found');
		}
		return sanitizeQuestion(question);
	},

	async updateQuestion(id, updateData) {
		const question = await Question.findByIdAndUpdate(id, updateData, { new: true });
		if (!question) {
			throw new Error('Question not found');
		}
		return sanitizeQuestion(question);
	},

	async deleteQuestion(id) {
		const question = await Question.findByIdAndDelete(id);
		if (!question) {
			throw new Error('Question not found');
		}
		return { message: 'Question deleted successfully' };
	},
};

module.exports = QuestionService;
