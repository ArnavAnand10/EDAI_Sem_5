const prisma = require('../config/prisma');

// Employee: Request a skill
async function requestSkill(req, res) {
  try {
    const { skillId, level } = req.body;
    const employeeId = req.user.employeeId;

    if (!skillId || !level) return res.status(400).json({ error: 'skillId and level required' });

    const request = await prisma.employeeSkill.create({
      data: {
        employeeId,
        skillId,
        level,
        status: 'PENDING',
      },
      include: { skill: true },
    });

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: Approve or reject skill request
async function updateSkillStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    const updated = await prisma.employeeSkill.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { employee: true, skill: true },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get skills of an employee (Employee or Admin)
async function getEmployeeSkills(req, res) {
  try {
    const employeeId = req.params.id ? parseInt(req.params.id) : req.user.employeeId;

    const skills = await prisma.employeeSkill.findMany({
      where: { employeeId },
      include: { skill: true },
    });

    res.json(skills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { requestSkill, updateSkillStatus, getEmployeeSkills };
