const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');

const { authenticateToken } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateToken);

// Admin-only routes
router.post('/', createEmployee);
router.delete('/:id', deleteEmployee);

// Accessible routes
router.get('/', getEmployees);
router.get('/:id', getEmployee);
router.put('/:id', updateEmployee);

module.exports = router;
