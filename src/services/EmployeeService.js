const Employee = require('../models/Employee');

function sanitizeEmployee(employee) {
	const {
		_id, email, role, firstName, lastName, position, department, hireDate, managerId,
	} = employee;
	return {
		id: _id, email, role, firstName, lastName, position, department, hireDate, managerId,
	};
}

const EmployeeService = {
	async createEmployee(employeeData) {
		const newEmployeeData = { ...employeeData, role: 'employee' };
		const employee = await Employee.create(newEmployeeData);
		return sanitizeEmployee(employee);
	},

	async getAllEmployees() {
		const employees = await Employee.find();
		return employees.map(sanitizeEmployee);
	},

	async getEmployeeById(id) {
		const employee = await Employee.findById(id);
		if (!employee) {
			throw new Error('Employee not found');
		}
		return sanitizeEmployee(employee);
	},

	async updateEmployee(id, updateData) {
		const employee = await Employee.findByIdAndUpdate(id, updateData, { new: true });
		if (!employee) {
			throw new Error('Employee not found');
		}
		return sanitizeEmployee(employee);
	},

	async deleteEmployee(id) {
		const employee = await Employee.findByIdAndDelete(id);
		if (!employee) {
			throw new Error('Employee not found');
		}
		return { message: 'Employee deleted successfully' };
	},
};

module.exports = EmployeeService;
