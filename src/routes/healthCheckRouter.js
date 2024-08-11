const express = require('express');
const { StatusCodes } = require('http-status-codes');

const healthCheckRouter = express.Router();

/**
 * @swagger
 * /api/health-check:
 *   get:
 *     summary: Perform a health check on the API
 *     tags:
 *       - Health Check
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "API - 👋🌎🌍🌏"
 */
healthCheckRouter.get('/health-check', (_req, res) => {
	// Creating success response object
	const response = {
		status: StatusCodes.OK,
		message: 'API - 👋🌎🌍🌏',
	};

	res.status(StatusCodes.OK).send(response); // Sending success response
});

module.exports = healthCheckRouter;
