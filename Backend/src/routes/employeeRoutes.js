const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// Admin routes
router.get('/', authenticateToken, isAdmin, getEmployees);
router.get('/:id', authenticateToken, isAdmin, getEmployee);
router.post('/', authenticateToken, isAdmin, createEmployee);
router.put('/:id', authenticateToken, isAdmin, updateEmployee);
router.delete('/:id', authenticateToken, isAdmin, deleteEmployee);

module.exports = router;
