const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
} = require('../controllers/companyController');

const { authenticateToken } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateToken);

// Admin-only routes
router.post('/', createCompany);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

// Accessible routes
router.get('/', getCompanies);
router.get('/:id', getCompany);

module.exports = router;
