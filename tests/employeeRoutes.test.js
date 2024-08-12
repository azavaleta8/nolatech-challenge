const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const createApp = require('../src/config/app');
const Employee = require('../src/models/Employee');
const User = require('../src/models/User');

let mongoServer;
let app;
let adminToken;
let managerToken;
let managerId;

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
	managerId = managerUser.id;
});

describe('Employee Routes', () => {
	describe('POST /api/employees', () => {
		it('should create a new employee when admin is authenticated', async () => {
			const res = await request(app)
				.post('/api/employees')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					email: 'employee@example.com',
					password: 'password123',
					firstName: 'John',
					lastName: 'Doe',
					position: 'Developer',
					department: 'IT',
					hireDate: new Date(),
					managerId,
				});

			expect(res.statusCode).toBe(201);
			expect(res.body).toHaveProperty('id');
			expect(res.body).toHaveProperty('email', 'employee@example.com');
			expect(res.body).toHaveProperty('role', 'employee');
			expect(res.body).toHaveProperty('managerId', managerId.toString());
			expect(res.body).not.toHaveProperty('password');
		});

		it('should return 422 if managerId is missing', async () => {
			const res = await request(app)
				.post('/api/employees')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					email: 'employee@example.com',
					password: 'password123',
					firstName: 'John',
					lastName: 'Doe',
					position: 'Developer',
					department: 'IT',
					hireDate: new Date(),
				});

			expect(res.statusCode).toBe(422);
			expect(res.body).toHaveProperty('errors');
		});

		it('should not allow employee creation for non-admin/manager users', async () => {
			const employee = await Employee.create({
				email: 'employee2@example.com',
				password: 'password123',
				role: 'employee',
				firstName: 'Jane',
				lastName: 'Doe',
				position: 'Manager',
				department: 'HR',
				hireDate: new Date(),
				managerId,
			});

			const employeeToken = jwt.sign({ userId: employee.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

			const res = await request(app)
				.post('/api/employees')
				.set('Authorization', `Bearer ${employeeToken}`)
				.send({
					email: 'newemployee@example.com',
					password: 'password123',
					firstName: 'Jane',
					lastName: 'Doe',
					position: 'Designer',
					department: 'Design',
					hireDate: new Date(),
					managerId,
				});

			expect(res.statusCode).toBe(403);
		});
	});

	describe('GET /api/employees', () => {
		it('should return all employees when authenticated', async () => {
			await Employee.create({
				email: 'employee1@example.com',
				password: 'password123',
				role: 'employee',
				firstName: 'John',
				lastName: 'Doe',
				position: 'Developer',
				department: 'IT',
				hireDate: new Date(),
				managerId,
			});

			const res = await request(app)
				.get('/api/employees')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(res.statusCode).toBe(200);
			expect(Array.isArray(res.body)).toBeTruthy();
			expect(res.body.length).toBeGreaterThan(0);
			expect(res.body[0]).toHaveProperty('email', 'employee1@example.com');
			expect(res.body[0]).toHaveProperty('managerId', managerId.toString());
		});

		it('should not allow access to employees list for unauthenticated users', async () => {
			const res = await request(app).get('/api/employees');

			expect(res.statusCode).toBe(401);
		});
	});

	describe('GET /api/employees/:id', () => {
		it('should return a specific employee when authenticated', async () => {
			const employee = await Employee.create({
				email: 'employee2@example.com',
				password: 'password123',
				role: 'employee',
				firstName: 'Jane',
				lastName: 'Doe',
				position: 'Manager',
				department: 'HR',
				hireDate: new Date(),
				managerId,
			});

			const res = await request(app)
				.get(`/api/employees/${employee.id}`)
				.set('Authorization', `Bearer ${adminToken}`);

			expect(res.statusCode).toBe(200);
			expect(res.body).toHaveProperty('id', employee.id.toString());
			expect(res.body).toHaveProperty('email', 'employee2@example.com');
			expect(res.body).toHaveProperty('managerId', managerId.toString());
		});

		it('should return 404 for non-existent employee', async () => {
			const nonExistentId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.get(`/api/employees/${nonExistentId}`)
				.set('Authorization', `Bearer ${adminToken}`);

			expect(res.statusCode).toBe(404);
		});
	});

	describe('PUT /api/employees/:id', () => {
		it('should update an employee when admin is authenticated', async () => {
			const employee = await Employee.create({
				email: 'updateme@example.com',
				password: 'password123',
				role: 'employee',
				firstName: 'Update',
				lastName: 'Me',
				position: 'Tester',
				department: 'QA',
				hireDate: new Date(),
				managerId,
			});

			const newManagerId = new mongoose.Types.ObjectId();

			const res = await request(app)
				.put(`/api/employees/${employee.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					email: 'updateme@example.com',
					firstName: 'Updated',
					lastName: 'Employee',
					position: 'Senior Tester',
					department: 'QA',
					hireDate: new Date(),
					managerId: newManagerId,
				});

			expect(res.statusCode).toBe(200);
			expect(res.body).toHaveProperty('firstName', 'Updated');
			expect(res.body).toHaveProperty('lastName', 'Employee');
			expect(res.body).toHaveProperty('position', 'Senior Tester');
			expect(res.body).toHaveProperty('managerId', newManagerId.toString());
		});

		it('should not allow employee update for non-admin/manager users', async () => {
			const employee = await Employee.create({
				email: 'cannotupdate@example.com',
				password: 'password123',
				role: 'employee',
				firstName: 'Cannot',
				lastName: 'Update',
				position: 'Junior',
				department: 'IT',
				hireDate: new Date(),
				managerId,
			});

			const employeeToken = jwt.sign({ userId: employee.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

			const res = await request(app)
				.put(`/api/employees/${employee.id}`)
				.set('Authorization', `Bearer ${employeeToken}`)
				.send({
					email: 'cannotupdate@example.com',
					firstName: 'Tried',
					lastName: 'ToUpdate',
					position: 'Junior',
					department: 'IT',
					hireDate: new Date(),
					managerId,
				});

			expect(res.statusCode).toBe(403);
		});
	});

	describe('DELETE /api/employees/:id', () => {
		it('should delete an employee when admin is authenticated', async () => {
			const employee = await Employee.create({
				email: 'deleteme@example.com',
				password: 'password123',
				role: 'employee',
				firstName: 'Delete',
				lastName: 'Me',
				position: 'Temporary',
				department: 'Temp',
				hireDate: new Date(),
				managerId,
			});

			const res = await request(app)
				.delete(`/api/employees/${employee.id}`)
				.set('Authorization', `Bearer ${adminToken}`);

			expect(res.statusCode).toBe(200);
			expect(res.body).toHaveProperty('message', 'Employee deleted successfully');

			const deletedEmployee = await Employee.findById(employee.id);
			expect(deletedEmployee).toBeNull();
		});

		it('should not allow employee deletion for non-admin users', async () => {
			const employee = await Employee.create({
				email: 'cannotdelete@example.com',
				password: 'password123',
				role: 'employee',
				firstName: 'Cannot',
				lastName: 'Delete',
				position: 'Permanent',
				department: 'Secure',
				hireDate: new Date(),
				managerId,
			});

			const res = await request(app)
				.delete(`/api/employees/${employee.id}`)
				.set('Authorization', `Bearer ${managerToken}`);

			expect(res.statusCode).toBe(403);

			const stillExistingEmployee = await Employee.findById(employee.id);
			expect(stillExistingEmployee).not.toBeNull();
		});
	});
});
