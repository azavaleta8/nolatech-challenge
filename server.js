const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');

// Cargar variables de entorno
dotenv.config();

// Configuración de Mongoose
mongoose.set('strictQuery', false); // Abordar la advertencia de deprecación

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev')); // Logging de solicitudes HTTP
app.use(cors()); // Habilitar CORS para todas las rutas

// Rutas básicas (las expandiremos más adelante)
app.get('/', (req, res) => {
	res.json({ message: 'API de Evaluación 360 funcionando' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: 'Ocurrió un error en el servidor' });
});

// Variables de entorno
const NODE_ENV = process.env.NODE_ENV || 'dev';
const PORT = process.env.PORT || 3000;
const HOST = process.env.RENDER_EXTERNAL_URL || 'localhost';
const MONGODB_URI = process.env.MONGODB_URI;

// Función para iniciar el servidor
const startServer = async () => {
	try {
		// Conectar a MongoDB
		await mongoose.connect(MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('MongoDB initialized successfully:', mongoose.connection.host);

		// Iniciar el servidor
		app.listen(PORT, () => {
			console.log(`Server (${NODE_ENV}) running on http://${HOST}:${PORT}`);
			// console.log(`Swagger docs are available at http://${HOST}:${PORT}/api-docs`);
		});
	} catch (error) {
		console.error('Error initializing the server:', error);
		process.exit(1);
	}
};

// Iniciar el servidor
startServer();

module.exports = app;