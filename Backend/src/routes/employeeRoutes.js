const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');
const {
  getMyProfile,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

// Employee routes
router.get('/me', authenticateToken, getMyProfile);
router.get('/', authenticateToken, getAllEmployees);
router.get('/:id', authenticateToken, getEmployeeById);
router.put('/:id', authenticateToken, isAdmin, updateEmployee);
router.delete('/:id', authenticateToken, isAdmin, deleteEmployee);

module.exports = router;
