const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const createApp = require('../src/config/app');
const Question = require('../src/models/Question');
const User = require('../src/models/User');

let mongoServer;
let app;
let adminToken;
let employeeToken;

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
	await Question.deleteMany({});
	await User.deleteMany({});

	const adminUser = await User.create({
		email: 'admin@example.com',
		password: 'password123',
		role: 'admin',
	});
	adminToken = jwt.sign({ userId: adminUser.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

	const employeeUser = await User.create({
		email: 'employee@example.com',
		password: 'password123',
		role: 'employee',
	});
	employeeToken = jwt.sign({ userId: employeeUser.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
});

describe('Question Routes', () => {
	describe('POST /api/questions', () => {
		it('should create a new question when admin is authenticated', async () => {
			const res = await request(app)
				.post('/api/questions')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					text: 'What is 2 + 2?',
					options: ['3', '4', '5', '6'],
					correctAnswer: 1,
					category: 'Math',
				});

			expect(res.statusCode).toBe(201);
			expect(res.body).toHaveProperty('id');
			expect(res.body.text).toBe('What is 2 + 2?');
			expect(res.body.options).toHaveLength(4);
			expect(res.body.correctAnswer).toBe(1);
			expect(res.body.category).toBe('Math');
		});

		it('should return 422 if question data is invalid', async () => {
			const res = await request(app)
				.post('/api/questions')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					text: '',
					options: ['3'],
					correctAnswer: 5,
					category: '',
				});

			expect(res.statusCode).toBe(422);
			expect(res.body).toHaveProperty('errors');
		});

		it('should return 403 if non-admin tries to create a question', async () => {
			const res = await request(app)
				.post('/api/questions')
				.set('Authorization', `Bearer ${employeeToken}`)
				.send({
					text: 'What is 2 + 2?',
					options: ['3', '4', '5', '6'],
					correctAnswer: 1,
					category: 'Math',
				});

			expect(res.statusCode).toBe(403);
		});
	});

	describe('GET /api/questions', () => {
		it('should return all questions when authenticated', async () => {
			await Question.create({
				text: 'What is 2 + 2?',
				options: ['3', '4', '5', '6'],
				correctAnswer: 1,
				category: 'Math',
			});

			const res = await request(app)
				.get('/api/questions')
				.set('Authorization', `Bearer ${employeeToken}`);

			expect(res.statusCode).toBe(200);
			expect(Array.isArray(res.body)).toBeTruthy();
			expect(res.body).toHaveLength(1);
			expect(res.body[0].text).toBe('What is 2 + 2?');
		});

		it('should return 401 for unauthenticated request', async () => {
			const res = await request(app).get('/api/questions');

			expect(res.statusCode).toBe(401);
		});
	});

	describe('GET /api/questions/:id', () => {
		it('should return a specific question when authenticated', async () => {
			const question = await Question.create({
				text: 'What is 2 + 2?',
				options: ['3', '4', '5', '6'],
				correctAnswer: 1,
				category: 'Math',
			});

			const res = await request(app)
				.get(`/api/questions/${question.id}`)
				.set('Authorization', `Bearer ${employeeToken}`);

			expect(res.statusCode).toBe(200);
			expect(res.body.id).toBe(question.id.toString());
			expect(res.body.text).toBe('What is 2 + 2?');
		});

		it('should return 404 for non-existent question', async () => {
			const nonExistentId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.get(`/api/questions/${nonExistentId}`)
				.set('Authorization', `Bearer ${employeeToken}`);

			expect(res.statusCode).toBe(404);
		});
	});

	describe('PUT /api/questions/:id', () => {
		it('should update a question when admin is authenticated', async () => {
			const question = await Question.create({
				text: 'What is 2 + 2?',
				options: ['3', '4', '5', '6'],
				correctAnswer: 1,
				category: 'Math',
			});

			const res = await request(app)
				.put(`/api/questions/${question.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					text: 'What is 3 + 3?',
					options: ['5', '6', '7', '8'],
					correctAnswer: 1,
					category: 'Math',
				});

			expect(res.statusCode).toBe(200);
			expect(res.body.text).toBe('What is 3 + 3?');
			expect(res.body.options).toEqual(['5', '6', '7', '8']);
		});

		it('should return 403 if non-admin tries to update a question', async () => {
			const question = await Question.create({
				text: 'What is 2 + 2?',
				options: ['3', '4', '5', '6'],
				correctAnswer: 1,
				category: 'Math',
			});

			const res = await request(app)
				.put(`/api/questions/${question.id}`)
				.set('Authorization', `Bearer ${employeeToken}`)
				.send({
					text: 'What is 3 + 3?',
					options: ['5', '6', '7', '8'],
					correctAnswer: 1,
					category: 'Math',
				});

			expect(res.statusCode).toBe(403);
		});
	});

	describe('DELETE /api/questions/:id', () => {
		it('should delete a question when admin is authenticated', async () => {
			const question = await Question.create({
				text: 'What is 2 + 2?',
				options: ['3', '4', '5', '6'],
				correctAnswer: 1,
				category: 'Math',
			});

			const res = await request(app)
				.delete(`/api/questions/${question.id}`)
				.set('Authorization', `Bearer ${adminToken}`);

			expect(res.statusCode).toBe(200);
			expect(res.body.message).toBe('Question deleted successfully');

			const deletedQuestion = await Question.findById(question.id);
			expect(deletedQuestion).toBeNull();
		});

		it('should return 403 if non-admin tries to delete a question', async () => {
			const question = await Question.create({
				text: 'What is 2 + 2?',
				options: ['3', '4', '5', '6'],
				correctAnswer: 1,
				category: 'Math',
			});

			const res = await request(app)
				.delete(`/api/questions/${question.id}`)
				.set('Authorization', `Bearer ${employeeToken}`);

			expect(res.statusCode).toBe(403);

			const stillExistingQuestion = await Question.findById(question.id);
			expect(stillExistingQuestion).not.toBeNull();
		});
	});
});
