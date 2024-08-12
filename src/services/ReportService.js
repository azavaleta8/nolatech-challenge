const Evaluation = require('../models/Evaluation');
const Employee = require('../models/Employee');

const calculateAverageDepartmentScore = (employeeScores) => {
	// If there are no scores, return 0
	if (Object.keys(employeeScores).length === 0) {
		return 0;
	}

	// Calculate the average score for each employee
	const employeeAverages = Object.values(employeeScores).map((scores) => {
		const totalScore = scores.reduce((sum, score) => sum + score, 0);
		return scores.length > 0 ? totalScore / scores.length : 0;
	});

	// Calculate the average of all employee averages
	const totalAverageScore = employeeAverages.reduce((sum, average) => sum + average, 0);
	return totalAverageScore / employeeAverages.length;
};

const calculateAverageScore = (evaluations) => {
	// If there are no evaluations, return 0
	if (evaluations.length === 0) {
		return 0;
	}

	// Sum up all valid scores
	const totalScore = evaluations.reduce((sum, evaluation) => {
		// Use nullish coalescing to handle null or undefined scores
		const score = evaluation?.score ?? 0;
		return sum + score;
	}, 0);

	// Calculate the average
	return totalScore / evaluations.length;
};

const ReportService = {
	async generateEmployeeReport(employeeId) {
		const employee = await Employee.findById(employeeId);
		if (!employee) {
			throw new Error('Employee not found');
		}

		const evaluations = await Evaluation.find({
			employeeId,
			status: 'completed',
		}).populate('questions.questionId');

		const report = {
			employee: {
				id: employee.id,
				name: `${employee.firstName} ${employee.lastName}`,
				position: employee.position,
				department: employee.department,
			},
			evaluations: evaluations.map((evaluation) => ({
				id: evaluation.id,
				period: evaluation.period,
				score: evaluation.score,
				questions: evaluation.questions.map((q) => ({
					text: q.questionId.text,
					answer: q.answer,
					correctAnswer: q.questionId.correctAnswer,
				})),
			})),
			averageScore: calculateAverageScore(evaluations),
		};

		return report;
	},

	async generateDepartmentReport(department) {
		const employees = await Employee.find({ department });
		const employeeIds = employees.map((emp) => emp.id);

		const evaluations = await Evaluation.find({
			employeeId: { $in: employeeIds },
			status: 'completed',
		});

		const employeeScores = {};
		evaluations.forEach((evaluation) => {
			if (!employeeScores[evaluation.employeeId]) {
				employeeScores[evaluation.employeeId] = [];
			}
			employeeScores[evaluation.employeeId].push(evaluation.score);
		});

		const report = {
			department,
			employeeCount: employees.length,
			averageDepartmentScore: calculateAverageDepartmentScore(employeeScores),
			employeeScores,
		};

		return report;
	},
};

module.exports = ReportService;
