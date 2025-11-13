const prisma = require('../config/prisma');

// Get all skills (public - anyone can view)
// EMPLOYEES see skills without weight, MANAGER/HR/ADMIN see with weight
const getAllSkills = async (req, res) => {
  try {
    const { category } = req.query;
    const userRole = req.user?.role;

    const skills = await prisma.skill.findMany({
      where: category ? { category } : {},
      orderBy: { name: 'asc' }
    });

    // Hide weight from EMPLOYEE role
    if (userRole === 'EMPLOYEE') {
      const skillsWithoutWeight = skills.map(({ weight, ...skill }) => skill);
      return res.json(skillsWithoutWeight);
    }

    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get skill by ID (public)
// EMPLOYEES see skills without weight, MANAGER/HR/ADMIN see with weight
const getSkillById = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    const skill = await prisma.skill.findUnique({
      where: { id: parseInt(id) },
      include: {
        employeeSkills: {
          where: { managerStatus: 'APPROVED' },
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                position: true
              }
            }
          }
        }
      }
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Hide weight from EMPLOYEE role
    if (userRole === 'EMPLOYEE') {
      const { weight, ...skillWithoutWeight } = skill;
      return res.json(skillWithoutWeight);
    }

    res.json(skill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new skill (HR only)
const createSkill = async (req, res) => {
  try {
    const { name, category, description, weight } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    const skill = await prisma.skill.create({
      data: {
        name,
        category: category || 'General',
        description: description || '',
        weight: weight !== undefined ? parseInt(weight) : 0
      }
    });

    res.status(201).json(skill);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Skill with this name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update skill (HR only)
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, weight } = req.body;

    const skill = await prisma.skill.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(weight !== undefined && { weight: parseInt(weight) })
      }
    });

    res.json(skill);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Skill not found' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Skill with this name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete skill (HR only)
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.skill.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Skill not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill
};
