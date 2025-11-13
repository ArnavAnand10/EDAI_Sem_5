const prisma = require('../config/prisma');

// Admin: View all users with their roles
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Change user role
const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be one of: EMPLOYEE, MANAGER, HR, ADMIN' 
      });
    }

    // Update user role
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            position: true
          }
        }
      }
    });

    res.json(user);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Admin: Assign manager to employee
const assignManager = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { managerId } = req.body; // This is userId of the manager

    if (!managerId) {
      return res.status(400).json({ error: 'Manager ID is required' });
    }

    // Verify manager exists and has MANAGER role
    const manager = await prisma.user.findUnique({
      where: { id: parseInt(managerId) },
      include: { employee: true }
    });

    if (!manager) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    if (manager.role !== 'MANAGER' && manager.role !== 'HR' && manager.role !== 'ADMIN') {
      return res.status(400).json({ error: 'Selected user must have MANAGER, HR, or ADMIN role' });
    }

    // Assign manager
    const employee = await prisma.employee.update({
      where: { id: parseInt(employeeId) },
      data: { managerId: parseInt(managerId) },
      include: {
        user: { select: { email: true, role: true } },
        manager: {
          include: {
            user: { select: { email: true, role: true } }
          }
        }
      }
    });

    res.json(employee);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Admin: Assign HR to employee/manager
const assignHR = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { hrId } = req.body; // This is userId of the HR

    if (!hrId) {
      return res.status(400).json({ error: 'HR ID is required' });
    }

    // Verify HR exists and has HR role
    const hr = await prisma.user.findUnique({
      where: { id: parseInt(hrId) },
      include: { employee: true }
    });

    if (!hr) {
      return res.status(404).json({ error: 'HR user not found' });
    }

    if (hr.role !== 'HR' && hr.role !== 'ADMIN') {
      return res.status(400).json({ error: 'Selected user must have HR or ADMIN role' });
    }

    // Assign HR
    const employee = await prisma.employee.update({
      where: { id: parseInt(employeeId) },
      data: { hrId: parseInt(hrId) },
      include: {
        user: { select: { email: true, role: true } },
        hr: {
          include: {
            user: { select: { email: true, role: true } }
          }
        }
      }
    });

    res.json(employee);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Admin: Get system overview/statistics
const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalEmployees,
      totalSkills,
      totalRatings,
      pendingApprovals,
      usersByRole,
      employeesByDepartment
    ] = await Promise.all([
      prisma.user.count(),
      prisma.employee.count(),
      prisma.skill.count(),
      prisma.employeeSkill.count(),
      prisma.employeeSkill.count({ where: { managerStatus: 'PENDING' } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),
      prisma.employee.groupBy({
        by: ['department'],
        _count: { department: true }
      })
    ]);

    res.json({
      totalUsers,
      totalEmployees,
      totalSkills,
      totalRatings,
      pendingApprovals,
      usersByRole,
      employeesByDepartment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  changeUserRole,
  assignManager,
  assignHR,
  getSystemStats
};
