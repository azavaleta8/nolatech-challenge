const { StatusCodes } = require('http-status-codes');

// Middleware to handle routes not found (404)
const notFoundMiddleware = (req, res, next) => {
	res.status(StatusCodes.NOT_FOUND).json({
		message: 'Resource not found',
	});
};

// Middleware to handle general errors
const errorHandlerMiddleware = (err, req, res, next) => {
	console.error(err.stack);

	const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
	const message = err.message || 'An error occurred on the server';

	res.status(statusCode).json({
		message,
		stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
	});
};

module.exports = {
	notFoundMiddleware,
	errorHandlerMiddleware,
};
