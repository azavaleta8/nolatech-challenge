const Question = require('../models/Question');

const QuestionService = {
  async createQuestion(questionData) {
    const question = await Question.create(questionData);
    return question;
  },

  async getAllQuestions() {
    return await Question.find();
  },

  async getQuestionById(id) {
    const question = await Question.findById(id);
    if (!question) {
      throw new Error('Question not found');
    }
    return question;
  },

  async updateQuestion(id, updateData) {
    const question = await Question.findByIdAndUpdate(id, updateData, { new: true });
    if (!question) {
      throw new Error('Question not found');
    }
    return question;
  },

  async deleteQuestion(id) {
    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      throw new Error('Question not found');
    }
    return { message: 'Question deleted successfully' };
  }
};

module.exports = QuestionService;