const prisma = require('../config/prisma');

// Get all employees (Admin only)
async function getEmployees(req, res) {
  try {
    const employees = await prisma.employee.findMany({
      include: { company: true },
    });
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get employee by ID
async function getEmployee(req, res) {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: { company: true },
    });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Create employee (Admin only)
async function createEmployee(req, res) {
  try {
    const { firstName, lastName, department, managerId, companyId } = req.body;
    if (!firstName) return res.status(400).json({ error: 'firstName is required' });

    const employee = await prisma.employee.create({
      data: { firstName, lastName, department, managerId, companyId },
    });

    res.status(201).json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update employee
async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete employee (Admin only)
async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    await prisma.employee.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
