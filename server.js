const dotenv = require('dotenv');
const mongoose = require('mongoose');
const createApp = require('./src/config/app');

// ENV
dotenv.config();

// Mongoose Conf
mongoose.set('strictQuery', false);

// Variables de entorno
const NODE_ENV = process.env.NODE_ENV || 'dev';
const PORT = process.env.PORT || 3000;
const HOST = process.env.RENDER_EXTERNAL_URL || 'localhost';
const { MONGODB_URI } = process.env;

// Funcion for connect to DB
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

// Funcion for starting the server
const startServer = async () => {
	try {
		await connectToDatabase();
		const app = createApp();

		// Run Server
		app.listen(PORT, () => {
			if (NODE_ENV == 'production') {
				console.log(`Server (${NODE_ENV}) running on ${HOST}`);
				console.log(`Swagger docs are available at ${HOST}/api-docs`);
			} else {
				console.log(`Server (${NODE_ENV}) running on http://${HOST}:${PORT}`);
				console.log(`Swagger docs are available at http://${HOST}:${PORT}/api-docs`);
			}
		});
	} catch (error) {
		console.error('Error initializing the server:', error);
		process.exit(1);
	}
};

// Start Server
startServer();
