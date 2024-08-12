# Nolatech Challenge - API RESTful

Este proyecto implementa una API RESTful para un sistema de evaluacion 360 grados de empleados remotos en una empresa de desarrollo de aplicaciones.

## Configuracion y Ejecucion del Proyecto

### Prerrequisitos

- Node.js (v14 o superior)
- MongoDB

### Instalacion

1. Clonar el repositorio:

   ```
   git clone https://github.com/azavaleta8/nolatech-challenge
   cd nolatech-challenge
   ```

2. Instalar dependencias:

   ```
   npm install
   ```

3. Crear un archivo `.env` en la raiz del proyecto y configurar las variables de entorno necesarias (ver seccion de Variables de Entorno).

4. Iniciar el servidor:
   ```
   npm run dev
   ```

El servidor estara corriendo en `http://localhost:3000` (o el puerto especificado en las variables de entorno).

## Estructura del Proyecto y Decisiones de Diseño

```
/src
  /config
  /controllers
  /middlewares
  /models
  /routes
  /services
  /utils
/tests
```

### Arquitectura

- Se implemento una arquitectura en capas (rutas, controladores, servicios, modelos).
- Se utilizo el patron repositorio para el acceso a datos, encapsulando la logica de la base de datos en los servicios.

### Decisiones de Diseño

1. Autenticacion y Autorizacion:

   - JWT para autenticacion.
   - Middleware de autorizacion basado en roles.

2. Manejo de Errores:

   - Implementacion de un middleware de manejo de errores centralizado.

3. Validacion de Datos:

   - Uso de express-validator para validar datos de entrada.

4. Seguridad:

   - Implementacion de rate limiting.
   - Sanitizacion de datos para prevenir inyecciones NoSQL.

5. Escalabilidad:
   - Diseño modular para facilitar la escalabilidad horizontal.

## Ejecucion de Tests

Para ejecutar los tests:

```
npm test
```

Para ejecutar los tests con cobertura:

## Variables de Entorno

Crear un archivo `.env` en la raiz del proyecto con las siguientes variables: (.env expuesto con propositos demostrativos)

```
NODE_ENV =dev
HOST=localhost
PORT=3000
MONGODB_URI=mongodb+srv://abelzavaleta08:9DJ4ku0bv6p6Tbze@cluster0.9ay3a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

## Endpoints de la API

Documentacion completa de la API disponible en Swagger UI:

- DEV: `http://localhost:3000/api-docs`
- PROD: `https://nolatech-challenge.onrender.com/api-docs/`

Endpoints principales:

### Autenticacion:

- POST /api/auth/register
  - Descripcion: Registra un nuevo usuario (admin o manager).
  - Acceso: Público
- POST /api/auth/login
  - Descripcion: Inicia sesion para un usuario existente.
  - Acceso: Público

### Usuarios:

- GET /api/users
  - Descripcion: Obtiene la lista de todos los usuarios.
  - Acceso: Solo admin
- GET /api/users/:id
  - Descripcion: Obtiene detalles de un usuario especifico.
  - Acceso: Admin

### Empleados:

- POST /api/employees
  - Descripcion: Crea un nuevo empleado.
  - Acceso: Admin y manager
- GET /api/employees
  - Descripcion: Obtiene la lista de todos los empleados.
  - Acceso: Admin y manager
- GET /api/employees/:id
  - Descripcion: Obtiene detalles de un empleado especifico.
  - Acceso: Admin, manager y el propio empleado
- PUT /api/employees/:id
  - Descripcion: Actualiza la informacion de un empleado.
  - Acceso: Admin y manager
- DELETE /api/employees/:id
  - Descripcion: Elimina un empleado del sistema.
  - Acceso: Solo admin

### Evaluaciones:

- POST /api/evaluations
  - Descripcion: Crea una nueva evaluacion.
  - Acceso: Admin y manager
- GET /api/evaluations
  - Descripcion: Obtiene la lista de todas las evaluaciones.
  - Acceso: Admin y manager
- GET /api/evaluations/:id
  - Descripcion: Obtiene detalles de una evaluacion especifica.
  - Acceso: Admin, manager
- PUT /api/evaluations/:id
  - Descripcion: Actualiza una evaluacion existente.
  - Acceso: Admin y manager
- POST /api/evaluations/:id/submit
  - Descripcion: Envia una evaluacion completada.
  - Acceso: Admin, manager
- DELETE /api/evaluations/:id
  - Descripcion: Elimina un evaluacion del sistema.
  - Acceso: Solo admin

### Preguntas:

- POST /api/questions
  - Descripcion: Crea una nueva pregunta para evaluaciones.
  - Acceso: Solo admin
- GET /api/questions
  - Descripcion: Obtiene la lista de todas las preguntas.
  - Acceso: Admin y manager
- GET /api/questions/:id
  - Descripcion: Obtiene detalles de una pregunta especifica.
  - Acceso: Solo admin
- PUT /api/questions/:id
  - Descripcion: Actualiza una pregunta existente.
  - Acceso: Solo admin
- DELETE /api/questions/:id
  - Descripcion: Elimina una pregunta del sistema.
  - Acceso: Solo admin

### Reportes:

- GET /api/reports/employee/:id
  - Descripcion: Genera un reporte de evaluacion para un empleado especifico.
  - Acceso: Admin, manager
- GET /api/reports/department/:id
  - Descripcion: Genera un reporte de evaluacion para un departamento especifico.
  - Acceso: Solo admin

Notas sobre permisos:

- Los endpoints marcados como "Solo admin" estan restringidos exclusivamente a usuarios con rol de administrador.
- Los endpoints accesibles por "Admin y manager" permiten el acceso a usuarios con roles de administrador o gerente.
- La autenticacion se realiza mediante tokens JWT, que deben ser incluidos en el encabezado de las solicitudes para los endpoints protegidos.

## Buenas Practicas Implementadas

- Uso de async/await para manejar operaciones asincronas.
- Implementacion de logging para facilitar el debugging y monitoreo.
- Uso de ESLint para mantener un estilo de codigo consistente.
- Implementacion de tests en todos los endpoints para asegurar la calidad del codigo.
