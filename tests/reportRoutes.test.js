const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const createApp = require('../src/config/app');
const Employee = require('../src/models/Employee');
const User = require('../src/models/User');
const Evaluation = require('../src/models/Evaluation');
const Question = require('../src/models/Question');

let mongoServer;
let app;
let adminToken;
let managerToken;
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
	await Employee.deleteMany({});
	await User.deleteMany({});
	await Evaluation.deleteMany({});
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
    employeeToken = jwt.sign({ userId: employeeId}, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

	evaluatorId = managerUser.id;

	const question = await Question.create({
		text: 'Sample question',
		options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
		correctAnswer: 2,
		category: 'General',
	});
	questionId = question.id;

	await Evaluation.create({
		employeeId,
		evaluatorId,
		period: '2023 Q2',
		status: 'completed',
		questions: [{ questionId, answer: 2 }],
		score: 85,
	});

});

describe('Report Routes', () => {
	describe('GET /api/reports/employee/:id', () => {
		it('should return employee report when admin is authenticated', async () => {
			const res = await request(app)
				.get(`/api/reports/employee/${employeeId}`)
				.set('Authorization', `Bearer ${adminToken}`);

			expect(res.statusCode).toBe(200);
			expect(res.body).toHaveProperty('employee');
			expect(res.body).toHaveProperty('evaluations');
			expect(res.body).toHaveProperty('averageScore');
			expect(res.body.employee.id).toBe(employeeId.toString());
		});

		it('should return 404 for non-existent employee', async () => {
			const nonExistentId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.get(`/api/reports/employee/${nonExistentId}`)
				.set('Authorization', `Bearer ${adminToken}`);

			expect(res.statusCode).toBe(404);
		});

		it('should return 403 if non-admin/manager tries to access employee report', async () => {
			const employeeToken = jwt.sign({ userId: employeeId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
			const res = await request(app)
				.get(`/api/reports/employee/${employeeId}`)
				.set('Authorization', `Bearer ${employeeToken}`);

			expect(res.statusCode).toBe(403);
		});
	});

	describe('GET /api/reports/department/:department', () => {
		it('should return department report when admin is authenticated', async () => {
			const res = await request(app)
				.get('/api/reports/department/IT')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(res.statusCode).toBe(200);
			expect(res.body).toHaveProperty('department');
			expect(res.body).toHaveProperty('employeeCount');
			expect(res.body).toHaveProperty('averageDepartmentScore');
			expect(res.body).toHaveProperty('employeeScores');
			expect(res.body.department).toBe('IT');
		});

		it('should return empty report for non-existent department', async () => {
			const res = await request(app)
				.get('/api/reports/department/NonExistent')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(res.statusCode).toBe(200);
			expect(res.body.employeeCount).toBe(0);
			expect(res.body.averageDepartmentScore).toBe(0);
			expect(res.body.employeeScores).toEqual({});
		});

		it('should return 403 if non-admin tries to access department report', async () => {
			const res = await request(app)
				.get('/api/reports/department/IT')
				.set('Authorization', `Bearer ${employeeToken}`);

			expect(res.statusCode).toBe(403);
		});
	});
});
