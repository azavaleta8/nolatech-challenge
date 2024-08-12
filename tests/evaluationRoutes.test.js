const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const createApp = require('../src/config/app');
const Evaluation = require('../src/models/Evaluation');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const Question = require('../src/models/Question');

let mongoServer;
let app;
let adminToken;
let managerToken;
let employeeToken;
let employeeId;
let evaluatorId;
let questionId;

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
	await Evaluation.deleteMany({});
	await User.deleteMany({});
	await Employee.deleteMany({});
	await Question.deleteMany({});

	const adminUser = await User.create({
		email: 'admin@example.com',
		password: 'password123',
		role: 'admin',
	});
	adminToken = jwt.sign({ userId: adminUser.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

	const managerUser = await User.create({
		email: 'manager@example.com',
		password: 'password123',
		role: 'manager',
	});
	managerToken = jwt.sign({ userId: managerUser.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

	const employee = await Employee.create({
		email: 'employee@example.com',
		password: 'password123',
		firstName: 'John',
		lastName: 'Doe',
		position: 'Developer',
		department: 'IT',
		hireDate: new Date(),
		managerId: managerUser.id,
	});
	employeeId = employee.id;
	employeeToken = jwt.sign({ userId: employee.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

	evaluatorId = managerUser.id;

	const question = await Question.create({
		text: 'Sample question',
		options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
		correctAnswer: 2,
		category: 'General',
	});
	questionId = question.id;
});

describe('Evaluation Routes', () => {
	describe('POST /api/evaluations', () => {
		it('should create a new evaluation when admin is authenticated', async () => {
			const res = await request(app)
				.post('/api/evaluations')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					employeeId,
					evaluatorId,
					period: '2023 Q2',
					questions: [{ questionId }],
				});

			expect(res.statusCode).toBe(201);
			expect(res.body).toHaveProperty('id');
			expect(res.body.employeeId).toBe(employeeId.toString());
			expect(res.body.evaluatorId).toBe(evaluatorId.toString());
			expect(res.body.period).toBe('2023 Q2');
			expect(res.body.status).toBe('pending');
			expect(res.body.questions).toHaveLength(1);
		});

		it('should return 422 if evaluation data is invalid', async () => {
			const res = await request(app)
				.post('/api/evaluations')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					employeeId: 'invalid',
					evaluatorId: 'invalid',
					period: '',
					questions: [],
				});

			expect(res.statusCode).toBe(422);
			expect(res.body).toHaveProperty('errors');
		});

		it('should return 403 if non-admin/manager tries to create an evaluation', async () => {
			const res = await request(app)
				.post('/api/evaluations')
				.set('Authorization', `Bearer ${employeeToken}`)
				.send({
					employeeId,
					evaluatorId,
					period: '2023 Q2',
					questions: [{ questionId }],
				});

			expect(res.statusCode).toBe(403);
		});
	});

	describe('GET /api/evaluations', () => {
		it('should return all evaluations when admin is authenticated', async () => {
			await Evaluation.create({
				employeeId,
				evaluatorId,
				period: '2023 Q2',
				questions: [{ questionId }],
			});

			const res = await request(app)
				.get('/api/evaluations')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(res.statusCode).toBe(200);
			expect(Array.isArray(res.body)).toBeTruthy();
			expect(res.body).toHaveLength(1);
			expect(res.body[0].employeeId).toBe(employeeId.toString());
		});

		it('should return 403 if non-admin/manager tries to get all evaluations', async () => {
			const res = await request(app)
				.get('/api/evaluations')
				.set('Authorization', `Bearer ${employeeToken}`);

			expect(res.statusCode).toBe(403);
		});
	});

	describe('GET /api/evaluations/:id', () => {
		it('should return a specific evaluation when admin is authenticated', async () => {
			const evaluation = await Evaluation.create({
				employeeId,
				evaluatorId,
				period: '2023 Q2',
				questions: [{ questionId }],
			});

			const res = await request(app)
				.get(`/api/evaluations/${evaluation.id}`)
				.set('Authorization', `Bearer ${adminToken}`);

			expect(res.statusCode).toBe(200);
			expect(res.body.id).toBe(evaluation.id.toString());
			expect(res.body.employeeId).toBe(employeeId.toString());
		});

		it('should return 404 for non-existent evaluation', async () => {
			const nonExistentId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.get(`/api/evaluations/${nonExistentId}`)
				.set('Authorization', `Bearer ${adminToken}`);

			expect(res.statusCode).toBe(404);
		});
	});

	describe('PUT /api/evaluations/:id', () => {
		it('should update an evaluation when admin is authenticated', async () => {
			const evaluation = await Evaluation.create({
				employeeId,
				evaluatorId,
				period: '2023 Q2',
				questions: [{ questionId }],
			});

			const res = await request(app)
				.put(`/api/evaluations/${evaluation.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					employeeId,
				    evaluatorId,
					period: '2023 Q3',
					questions: [{ questionId, answer: 2 }],
				});

			expect(res.statusCode).toBe(200);
			expect(res.body.period).toBe('2023 Q3');
			expect(res.body.questions[0].answer).toBe(2);
		});

		it('should return 403 if non-admin/manager tries to update an evaluation', async () => {
			const evaluation = await Evaluation.create({
				employeeId,
				evaluatorId,
				period: '2023 Q2',
				questions: [{ questionId }],
			});

			const res = await request(app)
				.put(`/api/evaluations/${evaluation.id}`)
				.set('Authorization', `Bearer ${employeeToken}`)
				.send({
					period: '2023 Q3',
				});

			expect(res.statusCode).toBe(403);
		});
	});

	describe('DELETE /api/evaluations/:id', () => {
		it('should delete an evaluation when admin is authenticated', async () => {
			const evaluation = await Evaluation.create({
				employeeId,
				evaluatorId,
				period: '2023 Q2',
				questions: [{ questionId }],
			});

			const res = await request(app)
				.delete(`/api/evaluations/${evaluation.id}`)
				.set('Authorization', `Bearer ${adminToken}`);

			expect(res.statusCode).toBe(200);
			expect(res.body.message).toBe('Evaluation deleted successfully');

			const deletedEvaluation = await Evaluation.findById(evaluation.id);
			expect(deletedEvaluation).toBeNull();
		});

		it('should return 403 if non-admin tries to delete an evaluation', async () => {
			const evaluation = await Evaluation.create({
				employeeId,
				evaluatorId,
				period: '2023 Q2',
				questions: [{ questionId }],
			});

			const res = await request(app)
				.delete(`/api/evaluations/${evaluation.id}`)
				.set('Authorization', `Bearer ${managerToken}`);

			expect(res.statusCode).toBe(403);

			const stillExistingEvaluation = await Evaluation.findById(evaluation.id);
			expect(stillExistingEvaluation).not.toBeNull();
		});
	});

	describe('POST /api/evaluations/:id/submit', () => {
		it('should submit an evaluation when admin/manager is authenticated', async () => {
			const evaluation = await Evaluation.create({
				employeeId,
				evaluatorId,
				period: '2023 Q2',
				questions: [{ questionId, answer: 2 }],
				status: 'pending',
			});

			const res = await request(app)
				.post(`/api/evaluations/${evaluation.id}/submit`)
				.set('Authorization', `Bearer ${managerToken}`);

			expect(res.statusCode).toBe(200);
			expect(res.body.status).toBe('completed');
			expect(res.body).toHaveProperty('score');
		});

		it('should return 403 if non-admin/manager tries to submit an evaluation', async () => {
			const evaluation = await Evaluation.create({
				employeeId,
				evaluatorId,
				period: '2023 Q2',
				questions: [{ questionId }],
				status: 'pending',
			});

			const res = await request(app)
				.post(`/api/evaluations/${evaluation.id}/submit`)
				.set('Authorization', `Bearer ${employeeToken}`);

			expect(res.statusCode).toBe(403);
		});
	});
});
