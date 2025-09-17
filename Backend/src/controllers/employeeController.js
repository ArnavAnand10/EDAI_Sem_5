const prisma = require('../config/prisma');

// --------------------- GET ALL EMPLOYEES ---------------------
// Admin only: get employees under this admin
async function getEmployees(req, res) {
  try {
    if (req.user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Admin access required' });

    const employees = await prisma.employee.findMany({
      where: { adminId: req.user.userId },
      include: { company: true, user: true, skills: { include: { skill: true } } },
    });

    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// --------------------- GET EMPLOYEE ---------------------
// Employee sees self, Admin sees any of their employees
async function getEmployee(req, res) {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: { company: true, user: true, skills: { include: { skill: true } } },
    });

    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    // Check permissions
    if (req.user.role === 'EMPLOYEE' && employee.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'ADMIN' && employee.adminId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// --------------------- CREATE EMPLOYEE ---------------------
// Admin only: create employee under them
async function createEmployee(req, res) {
  try {
    if (req.user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Admin access required' });

    const { firstName, lastName, department, manager, companyId, email, password } = req.body;
    if (!firstName || !email || !password)
      return res.status(400).json({ error: 'firstName, email, and password are required' });

    // Create User
    const hashedPassword = await require('../utils/hash').hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role: 'EMPLOYEE' },
    });

    // Create Employee
    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        department,
        manager,
        companyId,
        adminId: req.user.userId, // link to this admin
        user: { connect: { id: user.id } },
      },
    });

    res.status(201).json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// --------------------- UPDATE EMPLOYEE ---------------------
// Admin updates their employee; Employee updates self
async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    const employee = await prisma.employee.findUnique({ where: { id: parseInt(id) } });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    if (
      (req.user.role === 'ADMIN' && employee.adminId !== req.user.userId) ||
      (req.user.role === 'EMPLOYEE' && employee.userId !== req.user.userId)
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await prisma.employee.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// --------------------- DELETE EMPLOYEE ---------------------
// Admin only: delete employee under them
async function deleteEmployee(req, res) {
  try {
    if (req.user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Admin access required' });

    const { id } = req.params;
    const employee = await prisma.employee.findUnique({ where: { id: parseInt(id) } });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    if (employee.adminId !== req.user.userId)
      return res.status(403).json({ error: 'Access denied' });

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
