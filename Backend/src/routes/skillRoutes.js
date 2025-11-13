const express = require('express');
const router = express.Router();
const { authenticateToken, isHR } = require('../middlewares/authMiddleware');
const {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill
} = require('../controllers/skillController');

// Public routes (no auth needed)
router.get('/', getAllSkills);
router.get('/:id', getSkillById);

// HR-only routes
router.post('/', authenticateToken, isHR, createSkill);
router.put('/:id', authenticateToken, isHR, updateSkill);
router.delete('/:id', authenticateToken, isHR, deleteSkill);

module.exports = router;
