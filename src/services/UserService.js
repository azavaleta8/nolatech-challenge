const jwt = require('jsonwebtoken');
const User = require('../models/User');

function sanitizeUser(user) {
	const { _id, email, role } = user;
	return { id: _id, email, role };
}

function generateToken(userId) {
	return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
}

const UserService = {
	async registerUser(userData) {
		const user = await User.create(userData);
		return sanitizeUser(user);
	},

	async loginUser(email, password) {
		const user = await User.findOne({ email });
		if (!user || !(await user.comparePassword(password))) {
			throw new Error('Invalid credentials');
		}
		const token = generateToken(user.id);
		return { token };
	},

	async getAllUsers() {
		const users = await User.find({}).select('-password');
		return users.map((user) => sanitizeUser(user));
	},

	async getUserById(userId) {
		const user = await User.findById(userId).select('-password');
		if (!user) {
			throw new Error('User not found');
		}
		return sanitizeUser(user);
	},
};

module.exports = UserService;
