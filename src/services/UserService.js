const User = require('../models/User');
const { use } = require('../routes/userRoutes');

class UserService {
	async registerUser(userData) {
		const user = await User.create(userData);
		return this.sanitizeUser(user);
	}

	async getAllUsers() {
		const users = await User.find({}).select('-password');
		return users.map((user) => this.sanitizeUser(user));
	}

	async getUserById(userId) {
		const user = await User.findById(userId).select('-password');
		if (!user) {
			throw new Error('User not found');
		}
		return this.sanitizeUser(user);
	}

	sanitizeUser(user) {
		const {
			_id, email, role,
		} = user;
		return {
			id: _id, email, role,
		};
	}
}

module.exports = new UserService();
