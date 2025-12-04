const prisma = require('../config/prisma')
const {
	analyzeProjectRequirements,
	matchSkillToDatabase,
} = require('../services/geminiService')

/**
 * POST /api/projects/analyze
 * HR submits project requirements, Gemini extracts skills, system matches to DB
 * POST /api/projects/generate
 * Frontend helper: takes a `prompt` (project description) and returns
 * { projectName, description, requiredSkills: [{skillName, category, weight}] }
 * weight is mapped to 1-10 scale to fit frontend slider
 */
async function generateProject(req, res) {
	try {
		const { prompt } = req.body

		if (!prompt || !prompt.trim()) {
			return res.status(400).json({ error: 'prompt is required' })
		}

		console.log('Generating project skills from prompt via Gemini...')
		const geminiSkills = await analyzeProjectRequirements(prompt.trim())

		// Helper to guess category from skill name
		const guessCategory = (name) => {
			const n = name.toLowerCase()
			if (
				/react|vue|angular|svelte|frontend|css|html|tailwind|bootstrap/.test(
					n
				)
			)
				return 'Frontend'
			if (
				/node|express|django|spring|laravel|backend|ruby|php|go|golang/.test(
					n
				)
			)
				return 'Backend'
			if (
				/sql|postgres|mysql|mongodb|redis|database|dynamodb|cassandra/.test(
					n
				)
			)
				return 'Database'
			if (/aws|azure|gcp|cloud|google cloud|amazon web services/.test(n))
				return 'Cloud'
			if (
				/docker|kubernetes|k8s|ci\/?cd|jenkins|gitlab-ci|circleci/.test(
					n
				)
			)
				return 'DevOps'
			if (/android|ios|react native|flutter|swift|kotlin/.test(n))
				return 'Mobile'
			if (/design|ux|ui|figma|adobe/.test(n)) return 'Design'
			if (/test|jest|mocha|cypress|selenium|testing/.test(n))
				return 'Testing'
			return 'Programming'
		}

		// Map weights (1-100) -> (1-10) for frontend slider
		const requiredSkills = geminiSkills.map((s) => ({
			skillName: s.skillName,
			category: guessCategory(s.skillName),
			weight: Math.max(1, Math.min(10, Math.round((s.weight || 1) / 10))),
		}))

		// Derive a short project name from the prompt (first sentence or trimmed)
		let projectName = prompt.split(/\n|\.|\?/)[0].trim()
		if (!projectName) projectName = 'AI Generated Project'
		if (projectName.length > 120)
			projectName = projectName.substring(0, 120)

		return res.json({ projectName, description: prompt, requiredSkills })
	} catch (error) {
		console.error('Error generating project:', error)
		return res.status(500).json({
			error: 'Failed to generate project',
			details: error.message,
		})
	}
}
/**
 * Body: { name, description }
 */
async function analyzeProject(req, res) {
	try {
		const { name, description } = req.body
		if (!req.user || (!req.user.id && !req.user.userId)) {
			return res.status(401).json({ error: 'Unauthorized' })
		}
		const hrUserId = Number(req.user.id ?? req.user.userId)

		// Validate
		if (!name || !description) {
			return res
				.status(400)
				.json({ error: 'Project name and description are required' })
		}

		// Step 1: Get Gemini to analyze requirements
		console.log('Analyzing project requirements with Gemini AI...')
		const geminiSkills = await analyzeProjectRequirements(description)
		console.log('Gemini extracted skills:', geminiSkills)

		// Step 2: Get all skills from database
		const dbSkills = await prisma.skill.findMany({
			select: { id: true, name: true },
		})

		// Step 3: Match Gemini skills to DB skills
		const matchedSkills = []
		const missingSkills = []

		for (const geminiSkill of geminiSkills) {
			const matchedDbSkill = matchSkillToDatabase(
				geminiSkill.skillName,
				dbSkills
			)

			if (matchedDbSkill) {
				matchedSkills.push({
					skillId: matchedDbSkill.id,
					skillName: matchedDbSkill.name,
					originalName: geminiSkill.skillName,
					weight: geminiSkill.weight,
					isMissing: false,
				})
			} else {
				missingSkills.push({
					skillId: null,
					skillName: geminiSkill.skillName,
					originalName: geminiSkill.skillName,
					weight: geminiSkill.weight,
					isMissing: true,
				})
			}
		}
		// Step 4: Create project
		const project = await prisma.project.create({
			data: {
				name,
				description,
				createdBy: hrUserId,
				status: 'OPEN',
				skillRequirements: {
					create: [...matchedSkills, ...missingSkills].map(
						(skill) => ({
							skillId: skill.skillId,
							skillName: skill.originalName,
							weight: skill.weight,
							isMissing: skill.isMissing,
						})
					),
				},
			},
			include: {
				skillRequirements: {
					include: {
						skill: true,
					},
				},
			},
		})

		// Step 5: Calculate skill index for all employees
		await calculateCandidateMatches(project.id)

		// Step 6: Fetch ranked candidates
		const candidates = await prisma.projectCandidateMatch.findMany({
			where: { projectId: project.id },
			include: {
				employee: {
					include: {
						user: {
							select: { email: true, role: true },
						},
					},
				},
			},
			orderBy: { skillIndex: 'desc' },
		})

		return res.status(201).json({
			message: 'Project analyzed successfully',
			project: {
				id: project.id,
				name: project.name,
				description: project.description,
				status: project.status,
				createdAt: project.createdAt,
			},
			skillAnalysis: {
				total: geminiSkills.length,
				matched: matchedSkills.length,
				missing: missingSkills.length,
				matchedSkills: matchedSkills.map((s) => ({
					geminiName: s.originalName,
					dbName: s.skillName,
					weight: s.weight,
				})),
				missingSkills: missingSkills.map((s) => ({
					name: s.skillName,
					weight: s.weight,
				})),
			},
			candidates: candidates.map((c) => ({
				employeeId: c.employeeId,
				name: `${c.employee.firstName} ${
					c.employee.lastName || ''
				}`.trim(),
				email: c.employee.user.email,
				department: c.employee.department,
				position: c.employee.position,
				skillIndex: c.skillIndex,
				matchPercentage: c.matchPercentage,
				missingSkills: JSON.parse(c.missingSkills),
			})),
		})
	} catch (error) {
		console.error('Error analyzing project:', error)
		return res.status(500).json({
			error: 'Failed to analyze project',
			details: error.message,
		})
	}
}

/**
 * POST /api/projects
 * Create a project using frontend-provided skills
 * Body: { name, description, requiredSkills: [{ skillName, category, weight }] }
 */
async function createProject(req, res) {
	try {
		const { name, description, requiredSkills } = req.body
		if (!req.user || (!req.user.id && !req.user.userId)) {
			return res.status(401).json({ error: 'Unauthorized' })
		}
		const hrUserId = Number(req.user.id ?? req.user.userId)

		if (!name || !description) {
			return res
				.status(400)
				.json({ error: 'Project name and description are required' })
		}

		if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
			return res
				.status(400)
				.json({ error: 'requiredSkills array is required' })
		}

		// Get DB skills for matching
		const dbSkills = await prisma.skill.findMany({
			select: { id: true, name: true },
		})

		const matched = []
		const missing = []

		for (const s of requiredSkills) {
			const matchedDbSkill = matchSkillToDatabase(s.skillName, dbSkills)
			if (matchedDbSkill) {
				matched.push({
					skillId: matchedDbSkill.id,
					originalName: s.skillName,
					weight: s.weight,
					isMissing: false,
				})
			} else {
				missing.push({
					skillId: null,
					originalName: s.skillName,
					weight: s.weight,
					isMissing: true,
				})
			}
		}

		const project = await prisma.project.create({
			data: {
				name,
				description,
				createdBy: hrUserId,
				status: 'OPEN',
				skillRequirements: {
					create: [...matched, ...missing].map((skill) => ({
						skillId: skill.skillId,
						skillName: skill.originalName,
						weight: skill.weight,
						isMissing: skill.isMissing,
					})),
				},
			},
			include: {
				skillRequirements: {
					include: { skill: true },
				},
			},
		})

		// Recalculate candidate matches
		await calculateCandidateMatches(project.id)

		return res.status(201).json({
			message: 'Project created successfully',
			project: {
				id: project.id,
				name: project.name,
				description: project.description,
				status: project.status,
				createdAt: project.createdAt,
			},
			requiredSkills: project.skillRequirements.map((r) => ({
				name: r.skill?.name || r.skillName,
				weight: r.weight,
				isMissing: r.isMissing,
			})),
		})
	} catch (error) {
		console.error('Error creating project:', error)
		return res
			.status(500)
			.json({ error: 'Failed to create project', details: error.message })
	}
}
/**
 * Calculate skill index for all employees for a project
 * Formula: Σ(project_weight × employee_rating) / count(project_required_skills)
 * Only includes employees who have ALL required skills (non-missing ones)
 */
async function calculateCandidateMatches(projectId) {
	try {
		// Get project skill requirements (only non-missing skills)
		const requirements = await prisma.projectSkillRequirement.findMany({
			where: {
				projectId,
				isMissing: false,
				skillId: { not: null },
			},
		})

		if (requirements.length === 0) {
			console.log('No valid skill requirements found for project')
			return
		}

		const requiredSkillIds = requirements.map((r) => r.skillId)
		const totalRequiredSkills = requirements.length

		// Get all employees
		const employees = await prisma.employee.findMany({
			include: {
				skills: {
					where: {
						skillId: { in: requiredSkillIds },
						managerStatus: 'APPROVED', // Only count approved skills
					},
				},
			},
		})

		// Calculate matches for each employee
		const candidateMatches = []

		for (const employee of employees) {
			// Map employee skills to skillId -> rating
			const employeeSkillMap = new Map()
			employee.skills.forEach((es) => {
				employeeSkillMap.set(
					es.skillId,
					es.managerRating || es.selfRating
				)
			})

			// Check which required skills employee has and collect missing names
			const missingSkillNames = []

			for (const req of requirements) {
				if (!employeeSkillMap.has(req.skillId)) {
					const skill = await prisma.skill.findUnique({
						where: { id: req.skillId },
						select: { name: true },
					})
					missingSkillNames.push(skill?.name || req.skillName)
				}
			}

			// Calculate skill index (treat missing skill rating as 0)
			let totalWeightedScore = 0

			for (const req of requirements) {
				const rating = employeeSkillMap.get(req.skillId) || 0
				totalWeightedScore += req.weight * rating
			}

			const skillIndex = totalWeightedScore / totalRequiredSkills

			// matchedCount is the number of required skills this employee has (employee.skills was filtered to requiredSkillIds)
			const matchedCount = employee.skills.length || 0
			const matchPercentage = (matchedCount / totalRequiredSkills) * 100

			candidateMatches.push({
				projectId,
				employeeId: employee.id,
				skillIndex: Math.round(skillIndex * 100) / 100, // Round to 2 decimals
				matchPercentage: Math.round(matchPercentage * 100) / 100,
				missingSkills: JSON.stringify(missingSkillNames),
			})
		}

		// Delete old matches and insert new ones
		await prisma.projectCandidateMatch.deleteMany({ where: { projectId } })

		if (candidateMatches.length > 0) {
			await prisma.projectCandidateMatch.createMany({
				data: candidateMatches,
			})
		}

		console.log(
			`Created ${candidateMatches.length} candidate matches for project ${projectId}`
		)
	} catch (error) {
		console.error('Error calculating candidate matches:', error)
		throw error
	}
}

/**
 * GET /api/projects/:id/candidates
 * HR/Admin views ranked employees for a project
 */
async function getProjectCandidates(req, res) {
	try {
		const { id } = req.params
		const projectId = parseInt(id)

		// Get project details
		const project = await prisma.project.findUnique({
			where: { id: projectId },
			include: {
				skillRequirements: {
					include: {
						skill: true,
					},
				},
			},
		})

		if (!project) {
			return res.status(404).json({ error: 'Project not found' })
		}

		// Fetch existing assignments so we can exclude assigned employees from candidate list
		const assignments = await prisma.projectAssignment.findMany({
			where: { projectId },
			include: {
				employee: {
					include: {
						user: { select: { email: true } },
					},
				},
			},
		})

		const assignedEmployeeIds = assignments.map((a) => a.employeeId)

		// Get candidates ranked by skill index, excluding already-assigned employees
		const candidateWhere = { projectId }
		if (assignedEmployeeIds.length > 0)
			candidateWhere.employeeId = { notIn: assignedEmployeeIds }

		const candidates = await prisma.projectCandidateMatch.findMany({
			where: candidateWhere,
			include: {
				employee: {
					include: {
						user: {
							select: { email: true, role: true },
						},
					},
				},
			},
			orderBy: { skillIndex: 'desc' },
		})

		return res.json({
			project: {
				id: project.id,
				name: project.name,
				description: project.description,
				status: project.status,
				requiredSkills: project.skillRequirements.map((r) => ({
					name: r.skill?.name || r.skillName,
					weight: r.weight,
					isMissing: r.isMissing,
				})),
			},
			candidates: candidates.map((c) => ({
				employeeId: c.employeeId,
				name: `${c.employee.firstName} ${
					c.employee.lastName || ''
				}`.trim(),
				email: c.employee.user.email,
				department: c.employee.department,
				position: c.employee.position,
				managerId: c.employee.managerId,
				skillIndex: c.skillIndex,
				matchPercentage: c.matchPercentage,
				missingSkills: JSON.parse(c.missingSkills),
			})),
			totalCandidates: candidates.length,
			assignedEmployees: assignments.map((a) => ({
				employeeId: a.employeeId,
				name: `${a.employee.firstName} ${
					a.employee.lastName || ''
				}`.trim(),
				email: a.employee.user.email,
				department: a.employee.department,
				position: a.employee.position,
				managerId: a.managerId,
				status: a.managerStatus,
				selectedAt: a.createdAt,
				approvedAt: a.approvedAt,
				comments: a.managerComments,
			})),
		})
	} catch (error) {
		console.error('Error fetching project candidates:', error)
		return res.status(500).json({
			error: 'Failed to fetch candidates',
			details: error.message,
		})
	}
}

/**
 * POST /api/projects/:id/select-employees
 * HR selects top K employees and creates approval requests for managers
 * Body: { employeeIds: [1, 2, 3] }
 */
async function selectEmployees(req, res) {
	try {
		const { id } = req.params
		const projectId = parseInt(id)
		const { employeeIds } = req.body
		const hrUserId = Number(req.user?.id ?? req.user?.userId)

		if (!hrUserId || Number.isNaN(hrUserId)) {
			return res.status(401).json({ error: 'Unauthorized' })
		}

		// Validate
		if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
			return res
				.status(400)
				.json({ error: 'employeeIds array is required' })
		}

		// Check project exists
		const project = await prisma.project.findUnique({
			where: { id: projectId },
		})

		if (!project) {
			return res.status(404).json({ error: 'Project not found' })
		}

		// Get selected employees with their managers and user relation
		const employees = await prisma.employee.findMany({
			where: {
				id: { in: employeeIds },
			},
			include: {
				user: true,
			},
		})

		// Debug: log employees fetched
		console.log('Selected employees for assignment:', employees.map(e => ({ id: e.id, managerId: e.managerId, userEmail: e.user?.email })))

		if (employees.length !== employeeIds.length) {
			return res
				.status(400)
				.json({ error: 'Some employee IDs are invalid' })
		}

		// Create assignments
		const assignments = []
		const errors = []

		for (const employee of employees) {
			if (!employee.managerId) {
				errors.push({
					employeeId: employee.id,
					error: 'Employee has no assigned manager',
				})
				continue
			}

			try {
				const assignment = await prisma.projectAssignment.create({
					data: {
						projectId,
						employeeId: employee.id,
						managerId: employee.managerId,
						selectedBy: hrUserId,
						managerStatus: 'PENDING',
					},
					include: {
						employee: {
							include: {
								user: {
									select: { email: true },
								},
							},
						},
					},
				})

				assignments.push({
					assignmentId: assignment.id,
					employeeId: employee.id,
					employeeName: `${employee.firstName} ${
						employee.lastName || ''
					}`.trim(),
					employeeEmail: employee.user.email,
					managerId: employee.managerId,
					status: 'PENDING',
				})
			} catch (err) {
				if (err.code === 'P2002') {
					errors.push({
						employeeId: employee.id,
						error: 'Employee already assigned to this project',
					})
				} else {
					throw err
				}
			}
		}

		return res.status(201).json({
			message: `${assignments.length} employees selected for approval`,
			assignments,
			errors: errors.length > 0 ? errors : undefined,
		})
	} catch (error) {
		console.error('Error selecting employees:', error)
		return res.status(500).json({
			error: 'Failed to select employees',
			details: error.message,
		})
	}
}

/**
 * GET /api/projects/my-requests
 * Manager views pending approval requests
 */
async function getMyRequests(req, res) {
	try {
		const managerUserId = req.user.id

		// Get assignments where this user is the manager
		const assignments = await prisma.projectAssignment.findMany({
			where: {
				managerId: managerUserId,
				managerStatus: 'PENDING',
			},
			include: {
				project: true,
				employee: {
					include: {
						user: {
							select: { email: true },
						},
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})

		return res.json({
			totalRequests: assignments.length,
			requests: assignments.map((a) => ({
				assignmentId: a.id,
				projectId: a.projectId,
				projectName: a.project.name,
				projectDescription: a.project.description,
				employee: {
					id: a.employeeId,
					name: `${a.employee.firstName} ${
						a.employee.lastName || ''
					}`.trim(),
					email: a.employee.user.email,
					department: a.employee.department,
					position: a.employee.position,
				},
				status: a.managerStatus,
				requestedAt: a.createdAt,
			})),
		})
	} catch (error) {
		console.error('Error fetching manager requests:', error)
		return res.status(500).json({
			error: 'Failed to fetch requests',
			details: error.message,
		})
	}
}

/**
 * PUT /api/projects/assignments/:id/approve
 * Manager approves or rejects employee assignment
 * Body: { action: "APPROVE" | "REJECT", comments?: string }
 */
async function approveAssignment(req, res) {
	try {
		const { id } = req.params
		const assignmentId = parseInt(id)
		const { action, comments } = req.body
		const managerUserId = req.user.id

		// Validate
		if (!['APPROVE', 'REJECT'].includes(action)) {
			return res
				.status(400)
				.json({ error: 'action must be APPROVE or REJECT' })
		}

		// Get assignment
		const assignment = await prisma.projectAssignment.findUnique({
			where: { id: assignmentId },
			include: {
				employee: true,
				project: true,
			},
		})

		if (!assignment) {
			return res.status(404).json({ error: 'Assignment not found' })
		}

		// Debug: log managerId and userId for troubleshooting
		console.log('ApproveAssignment: assignment.managerId =', assignment.managerId, 'req.user.id =', managerUserId);
		// Verify this is the right manager
		if (assignment.managerId !== managerUserId) {
			return res.status(403).json({
				error: 'You are not authorized to approve this assignment',
				assignmentManagerId: assignment.managerId,
				userId: managerUserId,
			})
		}

		// Check if already processed
		if (assignment.managerStatus !== 'PENDING') {
			return res.status(400).json({
				error: `Assignment already ${assignment.managerStatus.toLowerCase()}`,
			})
		}

		// Update assignment
		const updatedAssignment = await prisma.projectAssignment.update({
			where: { id: assignmentId },
			data: {
				managerStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
				managerComments: comments,
				approvedAt: new Date(),
			},
		})

		return res.json({
			message: `Assignment ${action.toLowerCase()}d successfully`,
			assignment: {
				id: updatedAssignment.id,
				projectName: assignment.project.name,
				employeeName: `${assignment.employee.firstName} ${
					assignment.employee.lastName || ''
				}`.trim(),
				status: updatedAssignment.managerStatus,
				comments: updatedAssignment.managerComments,
				approvedAt: updatedAssignment.approvedAt,
			},
		})
	} catch (error) {
		console.error('Error approving assignment:', error)
		return res.status(500).json({
			error: 'Failed to process approval',
			details: error.message,
		})
	}
}

/**
 * GET /api/projects
 * Get all projects (HR/Admin view)
 */
async function getAllProjects(req, res) {
	try {
		const projects = await prisma.project.findMany({
			include: {
				skillRequirements: {
					include: {
						skill: true,
					},
				},
				assignments: {
					where: {
						managerStatus: { in: ['PENDING', 'APPROVED'] },
					},
					include: {
						employee: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
							},
						},
					},
				},
				_count: {
					select: {
						candidateMatches: true,
						assignments: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})

		return res.json({
			totalProjects: projects.length,
			projects: projects.map((p) => ({
				id: p.id,
				name: p.name,
				description: p.description,
				status: p.status,
				createdAt: p.createdAt,
				requiredSkillsCount: p.skillRequirements.length,
				requiredSkills: p.skillRequirements.map((r) => ({
					id: r.id,
					skillId: r.skillId,
					weight: r.weight,
					skill: r.skill || null,
				})),
				candidatesCount: p._count.candidateMatches,
				assignmentsCount: p._count.assignments,
				assignments: p.assignments.map((a) => ({
					id: a.id,
					status: a.managerStatus || a.status || 'PENDING',
					employee: {
						id: a.employeeId,
						firstName: a.employee?.firstName || null,
						lastName: a.employee?.lastName || null,
					},
				})),
				pendingApprovals: p.assignments.filter(
					(a) => a.managerStatus === 'PENDING'
				).length,
			})),
		})
	} catch (error) {
		console.error('Error fetching projects:', error)
		return res.status(500).json({
			error: 'Failed to fetch projects',
			details: error.message,
		})
	}
}

/**
 * GET /api/projects/:id
 * Get project details with all assignments and their status
 */
async function getProjectDetails(req, res) {
	try {
		const { id } = req.params
		const projectId = parseInt(id)

		if (Number.isNaN(projectId)) {
			return res.status(400).json({ error: 'Invalid project id' })
		}

		const project = await prisma.project.findUnique({
			where: { id: projectId },
			include: {
				skillRequirements: {
					include: {
						skill: true,
					},
				},
				assignments: {
					include: {
						employee: {
							include: {
								user: {
									select: { email: true },
								},
							},
						},
					},
				},
				candidateMatches: {
					include: {
						employee: {
							include: {
								user: {
									select: { email: true },
								},
							},
						},
					},
					orderBy: { skillIndex: 'desc' },
				},
			},
		})

		if (!project) {
			return res.status(404).json({ error: 'Project not found' })
		}

		return res.json({
			id: project.id,
			name: project.name,
			description: project.description,
			status: project.status,
			createdAt: project.createdAt,
			requiredSkills: project.skillRequirements.map((r) => ({
				name: r.skill?.name || r.skillName,
				weight: r.weight,
				isMissing: r.isMissing,
			})),
			assignments: project.assignments.map((a) => ({
				id: a.id,
				employee: {
					id: a.employeeId,
					name: `${a.employee.firstName} ${
						a.employee.lastName || ''
					}`.trim(),
					email: a.employee.user.email,
					department: a.employee.department,
					position: a.employee.position,
				},
				managerId: a.managerId,
				status: a.managerStatus,
				comments: a.managerComments,
				selectedAt: a.createdAt,
				approvedAt: a.approvedAt,
			})),
			allCandidates: project.candidateMatches.map((c) => ({
				employeeId: c.employeeId,
				name: `${c.employee.firstName} ${
					c.employee.lastName || ''
				}`.trim(),
				email: c.employee.user.email,
				department: c.employee.department,
				skillIndex: c.skillIndex,
				matchPercentage: c.matchPercentage,
			})),
		})
	} catch (error) {
		console.error('Error fetching project details:', error)
		return res.status(500).json({
			error: 'Failed to fetch project details',
			details: error.message,
		})
	}
}

module.exports = {
	createProject,
	generateProject,
	analyzeProject,
	getProjectCandidates,
	selectEmployees,
	getMyRequests,
	approveAssignment,
	getAllProjects,
	getProjectDetails,
}
