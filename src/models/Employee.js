const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
	},
	role: {
		type: String,
		enum: ['employee'],
		default: 'employee',
	},
	firstName: {
		type: String,
		required: true,
		trim: true,
	},
	lastName: {
		type: String,
		required: true,
		trim: true,
	},
	position: {
		type: String,
		required: true,
		trim: true,
	},
	department: {
		type: String,
		required: true,
		trim: true,
	},
	hireDate: {
		type: Date,
		required: true,
	},
	managerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Employee',
		required: false,
	},
}, { timestamps: true });

// Hash password before saving
employeeSchema.pre('save', async function f(next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);
	return next();
});

// Method to compare password
employeeSchema.methods.comparePassword = async function f(candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
