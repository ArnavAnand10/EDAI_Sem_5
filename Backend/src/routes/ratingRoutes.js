const express = require('express');
const router = express.Router();
const { authenticateToken, isEmployee } = require('../middlewares/authMiddleware');
const {
  selfRateSkill,
  getMySkillRatings,
  getPendingApprovals,
  managerApproveSkill,
  getTeamSkillRatings
} = require('../controllers/ratingController');

// Employee routes - self rating
router.post('/self-rate', authenticateToken, isEmployee, selfRateSkill);
router.get('/my-ratings', authenticateToken, isEmployee, getMySkillRatings);

// Manager routes - approval
router.get('/pending', authenticateToken, getPendingApprovals);
router.put('/approve/:id', authenticateToken, managerApproveSkill);
router.get('/team', authenticateToken, getTeamSkillRatings);

module.exports = router;
