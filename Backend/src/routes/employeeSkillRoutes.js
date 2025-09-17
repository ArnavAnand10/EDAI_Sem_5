const express = require('express');
const router = express.Router();
const {
  requestSkill,
  updateSkillStatus,
  getEmployeeSkills,
} = require('../controllers/employeeSkillController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// Employee routes
router.post('/request', authenticateToken, requestSkill);
router.get('/:id', authenticateToken, getEmployeeSkills);

// Admin routes
router.put('/:id/status', authenticateToken, isAdmin, updateSkillStatus);

module.exports = router;
