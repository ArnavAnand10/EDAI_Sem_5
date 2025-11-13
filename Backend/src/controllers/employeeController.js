const prisma = require('../config/prisma');

// Get my profile (current user's employee data)
const getMyProfile = async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { userId: req.user.userId },
      include: {
        user: { select: { email: true, role: true } },
        manager: { 
          include: { 
            user: { select: { email: true, role: true } } 
          } 
        },
        hr: {
          include: {
            user: { select: { email: true, role: true } }
          }
        },
        skills: {
          include: { skill: true }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all employees (based on role hierarchy)
const getAllEmployees = async (req, res) => {
  try {
    const { role, userId } = req.user;

    let employees;

    if (role === 'ADMIN') {
      // Admin can see all employees
      employees = await prisma.employee.findMany({
        include: {
          user: { select: { email: true, role: true } },
          manager: { 
            select: { 
              firstName: true, 
              lastName: true,
              user: { select: { email: true, role: true } }
            } 
          },
          hr: {
            select: {
              firstName: true,
              lastName: true,
              user: { select: { email: true, role: true } }
            }
          }
        }
      });
    } else if (role === 'HR') {
      // HR can see their subordinates (employees + managers under them)
      employees = await prisma.employee.findMany({
        where: { hrId: userId },
        include: {
          user: { select: { email: true, role: true } },
          manager: { 
            select: { 
              firstName: true, 
              lastName: true,
              user: { select: { email: true, role: true } }
            } 
          },
          subordinates: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              position: true
            }
          }
        }
      });
    } else if (role === 'MANAGER') {
      // Manager can see their direct reports
      employees = await prisma.employee.findMany({
        where: { managerId: userId },
        include: {
          user: { select: { email: true, role: true } },
          skills: {
            include: { skill: true }
          }
        }
      });
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get employee by ID (with role-based access control)
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, userId } = req.user;

    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { email: true, role: true } },
        manager: { 
          select: { 
            firstName: true, 
            lastName: true,
            user: { select: { email: true, role: true } }
          } 
        },
        hr: {
          select: {
            firstName: true,
            lastName: true,
            user: { select: { email: true, role: true } }
          }
        },
        skills: {
          include: { 
            skill: true 
          }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check access permissions
    if (role === 'EMPLOYEE') {
      // Employee can only see their own profile
      if (employee.userId !== userId) {
        return res.status(403).json({ error: 'You can only view your own profile' });
      }
    } else if (role === 'MANAGER') {
      // Manager can only see their direct reports
      if (employee.managerId !== userId && employee.userId !== userId) {
        return res.status(403).json({ error: 'You can only view your direct reports' });
      }
    } else if (role === 'HR') {
      // HR can only see employees under them
      if (employee.hrId !== userId && employee.userId !== userId) {
        return res.status(403).json({ error: 'You can only view employees under you' });
      }
    }
    // Admin can see anyone (no check needed)

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update employee (only admin can change assignments)
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data,
      include: {
        user: { select: { email: true, role: true } }
      }
    });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete employee (admin only)
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.employee.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMyProfile,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};
