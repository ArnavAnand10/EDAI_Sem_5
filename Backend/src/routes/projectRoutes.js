const express = require('express');
const router = express.Router();
const { authenticateToken, isHR, isAdmin, isManager } = require('../middlewares/authMiddleware');
const projectController = require('../controllers/projectController');

// HR/Admin routes
router.post('/analyze', authenticateToken, isHR, projectController.analyzeProject);
router.get('/', authenticateToken, isHR, projectController.getAllProjects);
router.get('/:id', authenticateToken, isHR, projectController.getProjectDetails);
router.get('/:id/candidates', authenticateToken, isHR, projectController.getProjectCandidates);
router.post('/:id/select-employees', authenticateToken, isHR, projectController.selectEmployees);

// Manager routes
router.get('/my/requests', authenticateToken, isManager, projectController.getMyRequests);
router.put('/assignments/:id/approve', authenticateToken, isManager, projectController.approveAssignment);

module.exports = router;
