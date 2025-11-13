const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');
const {
  getAllUsers,
  changeUserRole,
  assignManager,
  assignHR,
  getSystemStats
} = require('../controllers/adminController');

// All admin routes require ADMIN role
router.get('/users', authenticateToken, isAdmin, getAllUsers);
router.put('/users/:userId/role', authenticateToken, isAdmin, changeUserRole);
router.put('/employees/:employeeId/assign-manager', authenticateToken, isAdmin, assignManager);
router.put('/employees/:employeeId/assign-hr', authenticateToken, isAdmin, assignHR);
router.get('/stats', authenticateToken, isAdmin, getSystemStats);

module.exports = router;
