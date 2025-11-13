const prisma = require('../config/prisma');

// Employee self-rates a skill (1-5)
const selfRateSkill = async (req, res) => {
  try {
    const { skillId, selfRating, selfComments } = req.body;

    // Validate rating
    if (!skillId || !selfRating || selfRating < 1 || selfRating > 5) {
      return res.status(400).json({ error: 'Skill ID and rating (1-5) are required' });
    }

    // Get employee ID from userId
    const employee = await prisma.employee.findUnique({
      where: { userId: req.user.userId }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    // Check if skill exists
    const skill = await prisma.skill.findUnique({
      where: { id: parseInt(skillId) }
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Create or update employee skill rating
    const employeeSkill = await prisma.employeeSkill.upsert({
      where: {
        employeeId_skillId: {
          employeeId: employee.id,
          skillId: parseInt(skillId)
        }
      },
      create: {
        employeeId: employee.id,
        skillId: parseInt(skillId),
        selfRating: parseInt(selfRating),
        selfComments: selfComments || ''
      },
      update: {
        selfRating: parseInt(selfRating),
        selfComments: selfComments || '',
        managerStatus: 'PENDING' // Reset status when employee updates rating
      },
      include: {
        skill: true,
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json(employeeSkill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get my skill ratings (employee view)
const getMySkillRatings = async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { userId: req.user.userId }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    const ratings = await prisma.employeeSkill.findMany({
      where: { employeeId: employee.id },
      include: {
        skill: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Manager: Get pending skill approvals (only for direct reports)
const getPendingApprovals = async (req, res) => {
  try {
    const { userId } = req.user;

    // Get all employees under this manager
    const subordinates = await prisma.employee.findMany({
      where: { managerId: userId },
      select: { id: true }
    });

    const subordinateIds = subordinates.map(emp => emp.id);

    // Get pending ratings for subordinates
    const pendingRatings = await prisma.employeeSkill.findMany({
      where: {
        employeeId: { in: subordinateIds },
        managerStatus: 'PENDING'
      },
      include: {
        skill: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            user: { select: { email: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(pendingRatings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Manager: Approve, reject, or modify employee skill rating
const managerApproveSkill = async (req, res) => {
  try {
    const { id } = req.params; // employeeSkill ID
    const { managerStatus, managerRating, managerComments } = req.body;

    // Validate status
    if (!managerStatus || !['APPROVED', 'REJECTED'].includes(managerStatus)) {
      return res.status(400).json({ error: 'Manager status must be APPROVED or REJECTED' });
    }

    // If approving, manager can optionally change the rating
    if (managerStatus === 'APPROVED' && managerRating) {
      if (managerRating < 1 || managerRating > 5) {
        return res.status(400).json({ error: 'Manager rating must be between 1-5' });
      }
    }

    // Get the employee skill record
    const employeeSkill = await prisma.employeeSkill.findUnique({
      where: { id: parseInt(id) },
      include: {
        employee: {
          include: {
            user: true
          }
        }
      }
    });

    if (!employeeSkill) {
      return res.status(404).json({ error: 'Skill rating not found' });
    }

    // Check if this manager manages this employee
    if (employeeSkill.employee.managerId !== req.user.userId) {
      return res.status(403).json({ error: 'You can only approve ratings for your direct reports' });
    }

    // Update the skill rating
    const updated = await prisma.employeeSkill.update({
      where: { id: parseInt(id) },
      data: {
        managerStatus,
        managerRating: managerRating ? parseInt(managerRating) : employeeSkill.selfRating, // Use manager's rating or keep self-rating
        managerComments: managerComments || '',
        managerApprovedAt: new Date(),
        managerApprovedBy: req.user.userId
      },
      include: {
        skill: true,
        employee: {
          select: {
            firstName: true,
            lastName: true,
            user: { select: { email: true } }
          }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Manager: View all skill ratings for team members
const getTeamSkillRatings = async (req, res) => {
  try {
    const { userId } = req.user;

    // Get all employees under this manager
    const subordinates = await prisma.employee.findMany({
      where: { managerId: userId },
      select: { id: true }
    });

    const subordinateIds = subordinates.map(emp => emp.id);

    // Get all ratings for subordinates
    const ratings = await prisma.employeeSkill.findMany({
      where: {
        employeeId: { in: subordinateIds }
      },
      include: {
        skill: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            user: { select: { email: true } }
          }
        }
      },
      orderBy: [
        { managerStatus: 'asc' }, // Pending first
        { updatedAt: 'desc' }
      ]
    });

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  selfRateSkill,
  getMySkillRatings,
  getPendingApprovals,
  managerApproveSkill,
  getTeamSkillRatings
};
