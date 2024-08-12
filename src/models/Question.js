const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
	text: {
		type: String,
		required: true,
		trim: true,
	},
	options: [{
		type: String,
		required: true,
	}],
	correctAnswer: {
		type: Number,
		required: true,
		min: 0,
	},
	category: {
		type: String,
		required: true,
		trim: true,
	},
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
