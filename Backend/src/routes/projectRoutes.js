const express = require('express')
const router = express.Router()
const {
	authenticateToken,
	isHR,
	isAdmin,
	isManager,
} = require('../middlewares/authMiddleware')
const projectController = require('../controllers/projectController')

// HR/Admin routes
router.post(
	'/analyze',
	authenticateToken,
	isHR,
	projectController.analyzeProject
)
// Create project directly from frontend data
router.post('/', authenticateToken, isHR, projectController.createProject)
// AI generation route used by frontend: POST /api/projects/generate
router.post(
	'/generate',
	authenticateToken,
	isHR,
	projectController.generateProject
)
// Also expose an explicit /all route to avoid conflicts with /:id
router.get('/all', authenticateToken, isHR, projectController.getAllProjects)
router.get('/', authenticateToken, isHR, projectController.getAllProjects)
router.get('/:id', authenticateToken, isHR, projectController.getProjectDetails)
router.get(
	'/:id/candidates',
	authenticateToken,
	isHR,
	projectController.getProjectCandidates
)
router.post(
	'/:id/select-employees',
	authenticateToken,
	isHR,
	projectController.selectEmployees
)

// Manager routes
router.get(
	'/my/requests',
	authenticateToken,
	isManager,
	projectController.getMyRequests
)
router.put(
	'/assignments/:id/approve',
	authenticateToken,
	isManager,
	projectController.approveAssignment
)

module.exports = router
