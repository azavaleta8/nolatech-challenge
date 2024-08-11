const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./swagger');

const createApp = () => {
	const app = express();

	// Middleware
	app.use(express.json());
	app.use(morgan('dev'));
	app.use(cors());

	// Configuración de Swagger
	const swaggerDocs = swaggerJsDoc(swaggerOptions);
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

	// Rutas básicas (las expandiremos más adelante)
	app.get('/', (req, res) => {
		res.json({ message: 'API de Evaluación 360 funcionando' });
	});

	// Manejo de errores global
	app.use((err, req, res, next) => {
		console.error(err.stack);
		res.status(500).json({ message: 'Ocurrió un error en el servidor' });
	});

	return app;
};

module.exports = createApp;
