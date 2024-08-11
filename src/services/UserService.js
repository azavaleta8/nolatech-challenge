const User = require('../models/User');

function sanitizeUser(user) {
	const { _id, email, role } = user;
	return { id: _id, email, role };
}

const UserService = {
	async registerUser(userData) {
		const user = await User.create(userData);
		return sanitizeUser(user);
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