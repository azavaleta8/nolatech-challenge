const { StatusCodes } = require('http-status-codes');
const EmployeeService = require('../services/EmployeeService');

exports.createEmployee = async (req, res, next) => {
	try {
		const employee = await EmployeeService.createEmployee(req.body);
		res.status(StatusCodes.CREATED).json(employee);
	} catch (error) {
		next(error);
	}
};

exports.getAllEmployees = async (req, res, next) => {
	try {
		const employees = await EmployeeService.getAllEmployees();
		res.status(StatusCodes.OK).json(employees);
	} catch (error) {
		next(error);
	}
};

exports.getEmployeeById = async (req, res, next) => {
	try {
		const employee = await EmployeeService.getEmployeeById(req.params.id);
		res.status(StatusCodes.OK).json(employee);
	} catch (error) {
		if (error.message === 'Employee not found') {
			res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
		} else {
			next(error);
		}
	}
};

exports.updateEmployee = async (req, res, next) => {
	try {
		const employee = await EmployeeService.updateEmployee(req.params.id, req.body);
		res.status(StatusCodes.OK).json(employee);
	} catch (error) {
		if (error.message === 'Employee not found') {
			res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
		} else {
			next(error);
		}
	}
};

exports.deleteEmployee = async (req, res, next) => {
	try {
		const result = await EmployeeService.deleteEmployee(req.params.id);
		res.status(StatusCodes.OK).json(result);
	} catch (error) {
		if (error.message === 'Employee not found') {
			res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
		} else {
			next(error);
		}
	}
};
