const express = require('express');
const evaluationController = require('../controllers/evaluationController');
const auth = require('../middlewares/auth');
const { validateEvaluation, validateEvaluationId } = require('../validators/evaluationValidation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Evaluation:
 *       type: object
 *       required:
 *         - employeeId
 *         - evaluatorId
 *         - period
 *         - questions
 *       properties:
 *         employeeId:
 *           type: string
 *           description: The ID of the employee being evaluated
 *         evaluatorId:
 *           type: string
 *           description: The ID of the user doing the evaluation
 *         period:
 *           type: string
 *           description: The evaluation period
 *         status:
 *           type: string
 *           enum: [pending, completed]
 *           description: The status of the evaluation
 *         questions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *                 description: The ID of the question
 *               answer:
 *                 type: number
 *                 description: The index of the user's answer
 *         score:
 *           type: number
 *           description: The overall score of the evaluation
 *     EvaluationUpdate:
 *       type: object
 *       required:
 *         - employeeId
 *         - evaluatorId
 *         - period
 *         - questions
 *       properties:
 *         employeeId:
 *           type: string
 *           description: The ID of the employee being evaluated
 *         evaluatorId:
 *           type: string
 *           description: The ID of the user doing the evaluation
 *         period:
 *           type: string
 *           description: The evaluation period
 *         questions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *                 description: The ID of the question
 *               answer:
 *                 type: number
 *                 description: The index of the user's answer
 */

/**
 * @swagger
 * /api/evaluations:
 *   post:
 *     summary: Create a new evaluation
 *     tags: [Evaluations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EvaluationUpdate'
 *     responses:
 *       201:
 *         description: Evaluation created successfully
 *       422:
 *         description: Validation error
 */
router.post('/', auth.protect, auth.restrictTo('admin', 'manager'), validateEvaluation, evaluationController.createEvaluation);

/**
 * @swagger
 * /api/evaluations:
 *   get:
 *     summary: Get all evaluations
 *     tags: [Evaluations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all evaluations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evaluation'
 */
router.get('/', auth.protect, auth.restrictTo('admin', 'manager'), evaluationController.getAllEvaluations);

/**
 * @swagger
 * /api/evaluations/{id}:
 *   get:
 *     summary: Get an evaluation by ID
 *     tags: [Evaluations]
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
 *         description: Evaluation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evaluation'
 *       404:
 *         description: Evaluation not found
 */
router.get('/:id', auth.protect, auth.restrictTo('admin', 'manager'), validateEvaluationId, evaluationController.getEvaluationById);

/**
 * @swagger
 * /api/evaluations/{id}:
 *   put:
 *     summary: Update an evaluation
 *     tags: [Evaluations]
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
 *             $ref: '#/components/schemas/EvaluationUpdate'
 *     responses:
 *       200:
 *         description: Evaluation updated successfully
 *       404:
 *         description: Evaluation not found
 *       422:
 *         description: Validation error
 */
router.put('/:id', auth.protect, auth.restrictTo('admin', 'manager'), validateEvaluationId, validateEvaluation, evaluationController.updateEvaluation);

/**
 * @swagger
 * /api/evaluations/{id}:
 *   delete:
 *     summary: Delete an evaluation
 *     tags: [Evaluations]
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
 *         description: Evaluation deleted successfully
 *       404:
 *         description: Evaluation not found
 */
router.delete('/:id', auth.protect, auth.restrictTo('admin'), validateEvaluationId, evaluationController.deleteEvaluation);

/**
 * @swagger
 * /api/evaluations/{id}/submit:
 *   post:
 *     summary: Submit an evaluation
 *     tags: [Evaluations]
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
 *         description: Evaluation submitted successfully
 *       404:
 *         description: Evaluation not found
 *       422:
 *         description: Validation error
 */
router.post('/:id/submit', auth.protect, auth.restrictTo('admin', 'manager'), validateEvaluationId, evaluationController.submitEvaluation);

module.exports = router;
