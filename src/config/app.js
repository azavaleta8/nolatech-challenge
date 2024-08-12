const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./swagger');
const { notFoundMiddleware, errorHandlerMiddleware } = require('../middlewares/errorHandle');

const healthCheckRouter = require('../routes/healthCheckRouter');
const userRoutes = require('../routes/userRoutes');
const employeeRoutes = require('../routes/employeeRoutes');
const questionRoutes = require('../routes/questionRoutes');
const evaluationRoutes = require('../routes/evaluationRoutes');

const createApp = () => {
	const app = express();

	// Middleware
	app.use(express.json());
	app.use(morgan('dev'));
	app.use(cors());

	// Swagger Config
	const swaggerDocs = swaggerJsDoc(swaggerOptions);
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

	// Routes
	app.use('/api', healthCheckRouter);
	app.use('/api/users', userRoutes);
	app.use('/api/employees', employeeRoutes);
	app.use('/api/questions', questionRoutes);
	app.use('/api/evaluations', evaluationRoutes);

	// Root route
	app.get('/', (req, res) => {
		res.json({ message: 'Nolatech Challnege API is running' });
	});

	// Error handling middlewares
	app.use(notFoundMiddleware);
	app.use(errorHandlerMiddleware);

	return app;
};

module.exports = createApp;
