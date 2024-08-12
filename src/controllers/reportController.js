const { StatusCodes } = require('http-status-codes');
const ReportService = require('../services/ReportService');

exports.getEmployeeReport = async (req, res, next) => {
	try {
		const report = await ReportService.generateEmployeeReport(req.params.id);
		res.status(StatusCodes.OK).json(report);
	} catch (error) {
		if (error.message === 'Employee not found') {
			res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
		} else {
			next(error);
		}
	}
};

exports.getDepartmentReport = async (req, res, next) => {
	try {
		const report = await ReportService.generateDepartmentReport(req.params.department);
		res.status(StatusCodes.OK).json(report);
	} catch (error) {
		next(error);
	}
};
