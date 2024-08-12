const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const Employee = require('../models/Employee');

exports.protect = async (req, res, next) => {
	try {
		let token;
		if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
			[, token] = req.headers.authorization.split(' ');
		}

		if (!token) {
			return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'You are not logged in. Please log in to get access.' });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

		let currentUser = await User.findById(decoded.userId);

		if (!currentUser) {
			currentUser = await Employee.findById(decoded.userId);
		}

		if (!currentUser) {
			return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'The user belonging to this token no longer exists.' });
		}

		req.user = currentUser;
		return next();
	} catch (error) {
		console.log(error);
		return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid token. Please log in again.' });
	}
};

exports.restrictTo = (...roles) => (req, res, next) => {
	if (!roles.includes(req.user.role)) {
		return res.status(StatusCodes.FORBIDDEN).json({ message: 'You do not have permission to perform this action' });
	}
	return next();
};
