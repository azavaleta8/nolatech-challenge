const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const createApp = require('../src/config/app');
const User = require('../src/models/User');

let mongoServer;
let app;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const mongoUri = mongoServer.getUri();
    mongoose.set('strictQuery', false);
	await mongoose.connect(mongoUri);
	app = await createApp();
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongoServer.stop();
});

beforeEach(async () => {
	await User.deleteMany({});
});

describe('User Routes', () => {
	describe('POST /api/users/auth/register', () => {
		it('should register a new admin user', async () => {
			const res = await request(app)
				.post('/api/users/auth/register')
				.send({
					email: 'admin@example.com',
					password: 'password123',
					role: 'admin',
				});

			expect(res.statusCode).toBe(201);
			expect(res.body).toHaveProperty('id');
			expect(res.body).toHaveProperty('email', 'admin@example.com');
			expect(res.body).toHaveProperty('role', 'admin');
			expect(res.body).not.toHaveProperty('password');
		});

		it('should register a new manager user', async () => {
			const res = await request(app)
				.post('/api/users/auth/register')
				.send({
					email: 'manager@example.com',
					password: 'password123',
					role: 'manager',
				});

			expect(res.statusCode).toBe(201);
			expect(res.body).toHaveProperty('id');
			expect(res.body).toHaveProperty('email', 'manager@example.com');
			expect(res.body).toHaveProperty('role', 'manager');
			expect(res.body).not.toHaveProperty('password');
		});

		it('should not allow registration of employee role', async () => {
			const res = await request(app)
				.post('/api/users/auth/register')
				.send({
					email: 'employee@example.com',
					password: 'password123',
					role: 'employee',
				});

			expect(res.statusCode).toBe(422);
			expect(res.body).toHaveProperty('errors');
		});

		it('should return 422 if validation fails', async () => {
			const res = await request(app)
				.post('/api/users/auth/register')
				.send({
					email: 'invalid-email',
					password: '123',
					role: 'invalid-role',
				});

			expect(res.statusCode).toBe(422);
			expect(res.body).toHaveProperty('errors');
		});
	});

	describe('POST /api/users/auth/login', () => {
		beforeEach(async () => {
			await User.create({
				email: 'admin@example.com',
				password: 'password123',
				role: 'admin',
			});
		});

		it('should login an existing user', async () => {
			const res = await request(app)
				.post('/api/users/auth/login')
				.send({
					email: 'admin@example.com',
					password: 'password123',
				});

			expect(res.statusCode).toBe(200);
			expect(res.body).toHaveProperty('token');
			expect(typeof res.body.token).toBe('string');

			// Verify the token
			const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET || 'secret');
			expect(decoded).toHaveProperty('userId');
		});

		it('should return 401 for invalid credentials', async () => {
			const res = await request(app)
				.post('/api/users/auth/login')
				.send({
					email: 'admin@example.com',
					password: 'wrongpassword',
				});

			expect(res.statusCode).toBe(401);
		});
	});

	describe('GET /api/users', () => {
		let adminToken;

		beforeEach(async () => {
			const adminUser = await User.create({
				email: 'admin@example.com',
				password: 'adminpassword',
				role: 'admin',
			});
			adminToken = jwt.sign({ userId: adminUser.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

			await User.create({
				email: 'manager@example.com',
				password: 'managerpassword',
				role: 'manager',
			});
		});

		it('should return all users for admin', async () => {
			const res = await request(app)
				.get('/api/users')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(res.statusCode).toBe(200);
			expect(res.body).toBeInstanceOf(Array);
			expect(res.body).toHaveLength(2);
			expect(res.body[0]).toHaveProperty('id');
			expect(res.body[0]).toHaveProperty('email');
			expect(res.body[0]).toHaveProperty('role');
			expect(res.body[0]).not.toHaveProperty('password');
		});

		it('should return 403 for non-admin users', async () => {
			const managerUser = await User.findOne({ role: 'manager' });
			const managerToken = jwt.sign({ userId: managerUser.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

			const res = await request(app)
				.get('/api/users')
				.set('Authorization', `Bearer ${managerToken}`);

			expect(res.statusCode).toBe(403);
		});
	});

	describe('GET /api/users/:id', () => {
		let user;
		let token;

		beforeEach(async () => {
			user = await User.create({
				email: 'admin@example.com',
				password: 'password123',
				role: 'admin',
			});
			token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
		});

		it('should return user by id', async () => {
			const res = await request(app)
				.get(`/api/users/${user.id}`)
				.set('Authorization', `Bearer ${token}`);

			expect(res.statusCode).toBe(200);
			expect(res.body).toHaveProperty('id', user.id.toString());
			expect(res.body).toHaveProperty('email', 'admin@example.com');
			expect(res.body).toHaveProperty('role', 'admin');
			expect(res.body).not.toHaveProperty('password');
		});

		it('should return 404 for non-existent user', async () => {
			const nonExistentId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.get(`/api/users/${nonExistentId}`)
				.set('Authorization', `Bearer ${token}`);

			expect(res.statusCode).toBe(404);
		});

		it('should return 422 for invalid user id', async () => {
			const res = await request(app)
				.get('/api/users/invalid-id')
				.set('Authorization', `Bearer ${token}`);

			expect(res.statusCode).toBe(422);
		});
	});
});
