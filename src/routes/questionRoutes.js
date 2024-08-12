const express = require('express');
const questionController = require('../controllers/questionController');
const auth = require('../middlewares/auth');
const { validateQuestion, validateQuestionId } = require('../validators/questionValidation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       required:
 *         - text
 *         - options
 *         - correctAnswer
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         text:
 *           type: string
 *           description: The text of the question
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           description: An array of possible answers
 *         correctAnswer:
 *           type: number
 *           description: The index of the correct answer in the options array
 *         category:
 *           type: string
 *           description: The category of the question
 *     QuestionInput:
 *       type: object
 *       required:
 *         - text
 *         - options
 *         - correctAnswer
 *         - category
 *       properties:
 *         text:
 *           type: string
 *           description: The text of the question
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           description: An array of possible answers
 *         correctAnswer:
 *           type: number
 *           description: The index of the correct answer in the options array
 *         category:
 *           type: string
 *           description: The category of the question
 */

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuestionInput'
 *     responses:
 *       201:
 *         description: Question created successfully
 *       422:
 *         description: Validation error
 */
router.post('/', auth.protect, auth.restrictTo('admin'), validateQuestion, questionController.createQuestion);

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 */
router.get('/', auth.protect, auth.restrictTo('admin', "manager"), questionController.getAllQuestions);

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get a question by ID
 *     tags: [Questions]
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
 *         description: Question details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: Question not found
 */
router.get('/:id', auth.protect, auth.restrictTo('admin', "manager"), validateQuestionId, questionController.getQuestionById);

/**
 * @swagger
 * /api/questions/{id}:
 *   put:
 *     summary: Update a question
 *     tags: [Questions]
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
 *             $ref: '#/components/schemas/QuestionInput'
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       404:
 *         description: Question not found
 *       422:
 *         description: Validation error
 */
router.put('/:id', auth.protect, auth.restrictTo('admin'), validateQuestionId, validateQuestion, questionController.updateQuestion);

/**
 * @swagger
 * /api/questions/{id}:
 *   delete:
 *     summary: Delete a question
 *     tags: [Questions]
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
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 */
router.delete('/:id', auth.protect, auth.restrictTo('admin'), validateQuestionId, questionController.deleteQuestion);

module.exports = router;
