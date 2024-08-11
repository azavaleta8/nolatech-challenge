const swaggerOptions = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'To Do API',
			version: '1.0.0',
			description: 'API documentation',
		},
		components: {
			securitySchemes: {
				BearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
	},
	apis: ['./src/api/**/*.js'], // Asegúrate de que esta ruta apunte a tus archivos de rutas
	persistAuthorization: true,
};

module.exports = swaggerOptions;
