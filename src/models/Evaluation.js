const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
	employeeId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Employee',
		required: true,
	},
	evaluatorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	period: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		enum: ['pending', 'completed'],
		default: 'pending',
	},
	questions: [{
		questionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Question',
			required: true,
		},
		answer: {
			type: Number,
			required: false,
		},
	}],
	score: {
		type: Number,
		default: 0,
	},
}, { timestamps: true });

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation;
