const express = require('express');
const reportController = require('../controllers/reportController');
const auth = require('../middlewares/auth');
const { validateEmployeeId, validateDepartment } = require('../validators/reportValidation');

const router = express.Router();

/**
 * @swagger
 * /api/reports/employee/{id}:
 *   get:
 *     summary: Get evaluation report for an employee
 *     tags: [Reports]
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
 *         description: Employee evaluation report
 *       404:
 *         description: Employee not found
 */
router.get('/employee/:id', auth.protect, auth.restrictTo('admin', 'manager'), validateEmployeeId, reportController.getEmployeeReport);

/**
 * @swagger
 * /api/reports/department/{department}:
 *   get:
 *     summary: Get evaluation report for a department
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: department
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department evaluation report
 */
router.get('/department/:department', auth.protect, auth.restrictTo('admin', 'manager'), validateDepartment, reportController.getDepartmentReport);

module.exports = router;
