const dotenv = require('dotenv');
const mongoose = require('mongoose');
const createApp = require('./src/config/app');

// Cargar variables de entorno
dotenv.config();

// Configuración de Mongoose
mongoose.set('strictQuery', false);

// Variables de entorno
const NODE_ENV = process.env.NODE_ENV || 'dev';
const PORT = process.env.PORT || 3000;
const HOST = process.env.RENDER_EXTERNAL_URL || 'localhost';
const { MONGODB_URI } = process.env;

// Función para conectar a MongoDB
const connectToDatabase = async () => {
	try {
		await mongoose.connect(MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('MongoDB initialized successfully:', mongoose.connection.host);
	} catch (error) {
		console.error('Error connecting to MongoDB:', error);
		process.exit(1);
	}
};

// Función para iniciar el servidor
const startServer = async () => {
	try {
		await connectToDatabase();
		const app = createApp();

		// Iniciar el servidor
		app.listen(PORT, () => {
			console.log(`Server (${NODE_ENV}) running on http://${HOST}:${PORT}`);
			console.log(`Swagger docs are available at http://${HOST}:${PORT}/api-docs`);
		});
	} catch (error) {
		console.error('Error initializing the server:', error);
		process.exit(1);
	}
};

// Iniciar el servidor
startServer();
