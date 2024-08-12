const express = require('express');
const employeeController = require('../controllers/employeeController');
const auth = require('../middlewares/auth');
const { validateEmployee, validateUserId, validateEmployeeUpdate } = require('../validators/employeeValidation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     EmployeeInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *         - position
 *         - department
 *         - hireDate
 *         - managerId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         position:
 *           type: string
 *         department:
 *           type: string
 *         hireDate:
 *           type: string
 *           format: date
 *         managerId:
 *           type: string
 *           format: uuid
 *     EmployeeUpdate:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         position:
 *           type: string
 *         department:
 *           type: string
 *         hireDate:
 *           type: string
 *           format: date
 *         managerId:
 *           type: string
 *           format: uuid
 */

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeInput'
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       422:
 *         description: Validation error
 */
router.post('/', auth.protect, auth.restrictTo('admin', 'manager'), validateEmployee, employeeController.createEmployee);

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EmployeeInput'
 */
router.get('/', auth.protect, auth.restrictTo('admin', 'manager'), employeeController.getAllEmployees);

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get an employee by ID
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeInput'
 *       404:
 *         description: Employee not found
 */
router.get('/:id', auth.protect, validateUserId, employeeController.getEmployeeById);

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Update an employee
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeUpdate'
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       404:
 *         description: Employee not found
 *       422:
 *         description: Validation error
 */
router.put('/:id', auth.protect, auth.restrictTo('admin', 'manager'), validateUserId, validateEmployeeUpdate, employeeController.updateEmployee);

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Delete an employee
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       404:
 *         description: Employee not found
 */
router.delete('/:id', auth.protect, auth.restrictTo('admin'), validateUserId, employeeController.deleteEmployee);

module.exports = router;
