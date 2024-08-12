const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		unique: true
	},
	firstName: {
		type: String,
		required: true,
		trim: true
	},
	lastName: {
		type: String,
		required: true,
		trim: true
	},
	position: {
		type: String,
		required: true,
		trim: true
	},
	department: {
		type: String,
		required: true,
		trim: true
	},
	hireDate: {
		type: Date,
		required: true
	},
	managerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: false
	}
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;