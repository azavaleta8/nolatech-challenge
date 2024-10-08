const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, 'Email is required'],
		unique: true,
		lowercase: true,
		trim: true,
	},
	password: {
		type: String,
		required: [true, 'Password is required'],
		minlength: 6,
	},
	role: {
		type: String,
		enum: ['admin', 'manager', 'employee'],
		default: 'admin',
	},
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function hashPassword(next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);
	return next();
});

// Method to compare password
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
