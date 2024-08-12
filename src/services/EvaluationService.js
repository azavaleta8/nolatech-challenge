const Evaluation = require('../models/Evaluation');
const Question = require('../models/Question');

const EvaluationService = {
  async createEvaluation(evaluationData) {
    const evaluation = await Evaluation.create(evaluationData);
    return evaluation;
  },

  async getAllEvaluations() {
    return await Evaluation.find().populate('employeeId evaluatorId');
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

    let score = 0;
    for (let i = 0; i < evaluation.questions.length; i++) {
      const question = await Question.findById(evaluation.questions[i].questionId);
      if (question.correctAnswer == evaluation.questions[i].answers) {
        score++;
      }
    }

    evaluation.score = (score / answers.length) * 100;
    evaluation.status = 'completed';
    await evaluation.save();

    return evaluation;
  }
};

module.exports = EvaluationService;