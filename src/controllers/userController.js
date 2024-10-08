const { StatusCodes } = require('http-status-codes');
const userService = require('../services/UserService');

exports.register = async (req, res, next) => {
	try {
		const result = await userService.registerUser(req.body);
		res.status(StatusCodes.CREATED).json(result);
	} catch (error) {
		next(error);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const result = await userService.loginUser(email, password);
		res.status(StatusCodes.OK).json(result);
	} catch (error) {
		if (error.message === 'Invalid credentials') {
			res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
		} else {
			next(error);
		}
	}
};

exports.getAllUsers = async (req, res, next) => {
	try {
		const users = await userService.getAllUsers();
		res.status(StatusCodes.OK).json(users);
	} catch (error) {
		next(error);
	}
};

exports.getUserById = async (req, res, next) => {
	try {
		const user = await userService.getUserById(req.params.id);
		res.status(StatusCodes.OK).json(user);
	} catch (error) {
		if (error.message === 'User not found') {
			res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
		} else {
			next(error);
		}
	}
};
