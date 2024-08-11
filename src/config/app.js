const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./swagger');


const healthCheckRouter = require('../routes/healthCheckRouter');

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

	app.get('/', (req, res) => {
		res.json({ message: 'API de Evaluación 360 funcionando' });
	});

	app.use((err, req, res, next) => {
		console.error(err.stack);
		res.status(500).json({ message: 'Ocurrió un error en el servidor' });
	});

	return app;
};

module.exports = createApp;