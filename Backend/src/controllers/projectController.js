const prisma = require('../config/prisma');
const { analyzeProjectRequirements, matchSkillToDatabase } = require('../services/geminiService');

/**
 * POST /api/projects/analyze
 * HR submits project requirements, Gemini extracts skills, system matches to DB
 * Body: { name, description }
 */
async function analyzeProject(req, res) {
  try {
    const { name, description } = req.body;
    const hrUserId = req.user.id;

    // Validate
    if (!name || !description) {
      return res.status(400).json({ error: 'Project name and description are required' });
    }

    // Step 1: Get Gemini to analyze requirements
    console.log('Analyzing project requirements with Gemini AI...');
    const geminiSkills = await analyzeProjectRequirements(description);
    console.log('Gemini extracted skills:', geminiSkills);

    // Step 2: Get all skills from database
    const dbSkills = await prisma.skill.findMany({
      select: { id: true, name: true }
    });

    // Step 3: Match Gemini skills to DB skills
    const matchedSkills = [];
    const missingSkills = [];

    for (const geminiSkill of geminiSkills) {
      const matchedDbSkill = matchSkillToDatabase(geminiSkill.skillName, dbSkills);
      
      if (matchedDbSkill) {
        matchedSkills.push({
          skillId: matchedDbSkill.id,
          skillName: matchedDbSkill.name,
          originalName: geminiSkill.skillName,
          weight: geminiSkill.weight,
          isMissing: false
        });
      } else {
        missingSkills.push({
          skillId: null,
          skillName: geminiSkill.skillName,
          originalName: geminiSkill.skillName,
          weight: geminiSkill.weight,
          isMissing: true
        });
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
          create: [...matchedSkills, ...missingSkills].map(skill => ({
            skillId: skill.skillId,
            skillName: skill.originalName,
            weight: skill.weight,
            isMissing: skill.isMissing
          }))
        }
      },
      include: {
        skillRequirements: {
          include: {
            skill: true
          }
        }
      }
    });

    // Step 5: Calculate skill index for all employees
    await calculateCandidateMatches(project.id);

    // Step 6: Fetch ranked candidates
    const candidates = await prisma.projectCandidateMatch.findMany({
      where: { projectId: project.id },
      include: {
        employee: {
          include: {
            user: {
              select: { email: true, role: true }
            }
          }
        }
      },
      orderBy: { skillIndex: 'desc' }
    });

    return res.status(201).json({
      message: 'Project analyzed successfully',
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdAt: project.createdAt
      },
      skillAnalysis: {
        total: geminiSkills.length,
        matched: matchedSkills.length,
        missing: missingSkills.length,
        matchedSkills: matchedSkills.map(s => ({
          geminiName: s.originalName,
          dbName: s.skillName,
          weight: s.weight
        })),
        missingSkills: missingSkills.map(s => ({
          name: s.skillName,
          weight: s.weight
        }))
      },
      candidates: candidates.map(c => ({
        employeeId: c.employeeId,
        name: `${c.employee.firstName} ${c.employee.lastName || ''}`.trim(),
        email: c.employee.user.email,
        department: c.employee.department,
        position: c.employee.position,
        skillIndex: c.skillIndex,
        matchPercentage: c.matchPercentage,
        missingSkills: JSON.parse(c.missingSkills)
      }))
    });

  } catch (error) {
    console.error('Error analyzing project:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze project',
      details: error.message 
    });
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
        skillId: { not: null }
      }
    });

    if (requirements.length === 0) {
      console.log('No valid skill requirements found for project');
      return;
    }

    const requiredSkillIds = requirements.map(r => r.skillId);
    const totalRequiredSkills = requirements.length;

    // Get all employees
    const employees = await prisma.employee.findMany({
      include: {
        skills: {
          where: {
            skillId: { in: requiredSkillIds },
            managerStatus: 'APPROVED' // Only count approved skills
          }
        }
      }
    });

    // Calculate matches for each employee
    const candidateMatches = [];

    for (const employee of employees) {
      // Map employee skills to skillId -> rating
      const employeeSkillMap = new Map();
      employee.skills.forEach(es => {
        employeeSkillMap.set(es.skillId, es.managerRating || es.selfRating);
      });

      // Check which required skills employee has
      const missingSkillNames = [];
      let hasAllRequiredSkills = true;

      for (const req of requirements) {
        if (!employeeSkillMap.has(req.skillId)) {
          hasAllRequiredSkills = false;
          const skill = await prisma.skill.findUnique({ 
            where: { id: req.skillId },
            select: { name: true }
          });
          missingSkillNames.push(skill?.name || req.skillName);
        }
      }

      // Skip employee if they don't have all required skills
      if (!hasAllRequiredSkills) {
        continue;
      }

      // Calculate skill index
      let totalWeightedScore = 0;

      for (const req of requirements) {
        const rating = employeeSkillMap.get(req.skillId) || 0;
        totalWeightedScore += req.weight * rating;
      }

      const skillIndex = totalWeightedScore / totalRequiredSkills;
      const matchPercentage = (employee.skills.length / totalRequiredSkills) * 100;

      candidateMatches.push({
        projectId,
        employeeId: employee.id,
        skillIndex: Math.round(skillIndex * 100) / 100, // Round to 2 decimals
        matchPercentage: Math.round(matchPercentage * 100) / 100,
        missingSkills: JSON.stringify(missingSkillNames)
      });
    }

    // Delete old matches and insert new ones
    await prisma.projectCandidateMatch.deleteMany({ where: { projectId } });
    
    if (candidateMatches.length > 0) {
      await prisma.projectCandidateMatch.createMany({
        data: candidateMatches
      });
    }

    console.log(`Created ${candidateMatches.length} candidate matches for project ${projectId}`);

  } catch (error) {
    console.error('Error calculating candidate matches:', error);
    throw error;
  }
}

/**
 * GET /api/projects/:id/candidates
 * HR/Admin views ranked employees for a project
 */
async function getProjectCandidates(req, res) {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);

    // Get project details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        skillRequirements: {
          include: {
            skill: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get candidates ranked by skill index
    const candidates = await prisma.projectCandidateMatch.findMany({
      where: { projectId },
      include: {
        employee: {
          include: {
            user: {
              select: { email: true, role: true }
            }
          }
        }
      },
      orderBy: { skillIndex: 'desc' }
    });

    return res.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        requiredSkills: project.skillRequirements.map(r => ({
          name: r.skill?.name || r.skillName,
          weight: r.weight,
          isMissing: r.isMissing
        }))
      },
      candidates: candidates.map(c => ({
        employeeId: c.employeeId,
        name: `${c.employee.firstName} ${c.employee.lastName || ''}`.trim(),
        email: c.employee.user.email,
        department: c.employee.department,
        position: c.employee.position,
        managerId: c.employee.managerId,
        skillIndex: c.skillIndex,
        matchPercentage: c.matchPercentage,
        missingSkills: JSON.parse(c.missingSkills)
      })),
      totalCandidates: candidates.length
    });

  } catch (error) {
    console.error('Error fetching project candidates:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch candidates',
      details: error.message 
    });
  }
}

/**
 * POST /api/projects/:id/select-employees
 * HR selects top K employees and creates approval requests for managers
 * Body: { employeeIds: [1, 2, 3] }
 */
async function selectEmployees(req, res) {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);
    const { employeeIds } = req.body;
    const hrUserId = req.user.id;

    // Validate
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ error: 'employeeIds array is required' });
    }

    // Check project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get selected employees with their managers
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: employeeIds }
      }
    });

    if (employees.length !== employeeIds.length) {
      return res.status(400).json({ error: 'Some employee IDs are invalid' });
    }

    // Create assignments
    const assignments = [];
    const errors = [];

    for (const employee of employees) {
      if (!employee.managerId) {
        errors.push({
          employeeId: employee.id,
          error: 'Employee has no assigned manager'
        });
        continue;
      }

      try {
        const assignment = await prisma.projectAssignment.create({
          data: {
            projectId,
            employeeId: employee.id,
            managerId: employee.managerId,
            selectedBy: hrUserId,
            managerStatus: 'PENDING'
          },
          include: {
            employee: {
              include: {
                user: {
                  select: { email: true }
                }
              }
            }
          }
        });

        assignments.push({
          assignmentId: assignment.id,
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName || ''}`.trim(),
          employeeEmail: employee.user.email,
          managerId: employee.managerId,
          status: 'PENDING'
        });
      } catch (err) {
        if (err.code === 'P2002') {
          errors.push({
            employeeId: employee.id,
            error: 'Employee already assigned to this project'
          });
        } else {
          throw err;
        }
      }
    }

    return res.status(201).json({
      message: `${assignments.length} employees selected for approval`,
      assignments,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error selecting employees:', error);
    return res.status(500).json({ 
      error: 'Failed to select employees',
      details: error.message 
    });
  }
}

/**
 * GET /api/projects/my-requests
 * Manager views pending approval requests
 */
async function getMyRequests(req, res) {
  try {
    const managerUserId = req.user.id;

    // Get assignments where this user is the manager
    const assignments = await prisma.projectAssignment.findMany({
      where: {
        managerId: managerUserId,
        managerStatus: 'PENDING'
      },
      include: {
        project: true,
        employee: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      totalRequests: assignments.length,
      requests: assignments.map(a => ({
        assignmentId: a.id,
        projectId: a.projectId,
        projectName: a.project.name,
        projectDescription: a.project.description,
        employee: {
          id: a.employeeId,
          name: `${a.employee.firstName} ${a.employee.lastName || ''}`.trim(),
          email: a.employee.user.email,
          department: a.employee.department,
          position: a.employee.position
        },
        status: a.managerStatus,
        requestedAt: a.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching manager requests:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch requests',
      details: error.message 
    });
  }
}

/**
 * PUT /api/projects/assignments/:id/approve
 * Manager approves or rejects employee assignment
 * Body: { action: "APPROVE" | "REJECT", comments?: string }
 */
async function approveAssignment(req, res) {
  try {
    const { id } = req.params;
    const assignmentId = parseInt(id);
    const { action, comments } = req.body;
    const managerUserId = req.user.id;

    // Validate
    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ error: 'action must be APPROVE or REJECT' });
    }

    // Get assignment
    const assignment = await prisma.projectAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        employee: true,
        project: true
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verify this is the right manager
    if (assignment.managerId !== managerUserId) {
      return res.status(403).json({ error: 'You are not authorized to approve this assignment' });
    }

    // Check if already processed
    if (assignment.managerStatus !== 'PENDING') {
      return res.status(400).json({ 
        error: `Assignment already ${assignment.managerStatus.toLowerCase()}` 
      });
    }

    // Update assignment
    const updatedAssignment = await prisma.projectAssignment.update({
      where: { id: assignmentId },
      data: {
        managerStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        managerComments: comments,
        approvedAt: new Date()
      }
    });

    return res.json({
      message: `Assignment ${action.toLowerCase()}d successfully`,
      assignment: {
        id: updatedAssignment.id,
        projectName: assignment.project.name,
        employeeName: `${assignment.employee.firstName} ${assignment.employee.lastName || ''}`.trim(),
        status: updatedAssignment.managerStatus,
        comments: updatedAssignment.managerComments,
        approvedAt: updatedAssignment.approvedAt
      }
    });

  } catch (error) {
    console.error('Error approving assignment:', error);
    return res.status(500).json({ 
      error: 'Failed to process approval',
      details: error.message 
    });
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
            skill: true
          }
        },
        assignments: {
          where: {
            managerStatus: { in: ['PENDING', 'APPROVED'] }
          }
        },
        _count: {
          select: {
            candidateMatches: true,
            assignments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      totalProjects: projects.length,
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        createdAt: p.createdAt,
        requiredSkillsCount: p.skillRequirements.length,
        candidatesCount: p._count.candidateMatches,
        assignmentsCount: p._count.assignments,
        pendingApprovals: p.assignments.filter(a => a.managerStatus === 'PENDING').length
      }))
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch projects',
      details: error.message 
    });
  }
}

/**
 * GET /api/projects/:id
 * Get project details with all assignments and their status
 */
async function getProjectDetails(req, res) {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        skillRequirements: {
          include: {
            skill: true
          }
        },
        assignments: {
          include: {
            employee: {
              include: {
                user: {
                  select: { email: true }
                }
              }
            }
          }
        },
        candidateMatches: {
          include: {
            employee: {
              include: {
                user: {
                  select: { email: true }
                }
              }
            }
          },
          orderBy: { skillIndex: 'desc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt,
      requiredSkills: project.skillRequirements.map(r => ({
        name: r.skill?.name || r.skillName,
        weight: r.weight,
        isMissing: r.isMissing
      })),
      assignments: project.assignments.map(a => ({
        id: a.id,
        employee: {
          id: a.employeeId,
          name: `${a.employee.firstName} ${a.employee.lastName || ''}`.trim(),
          email: a.employee.user.email,
          department: a.employee.department,
          position: a.employee.position
        },
        managerId: a.managerId,
        status: a.managerStatus,
        comments: a.managerComments,
        selectedAt: a.createdAt,
        approvedAt: a.approvedAt
      })),
      allCandidates: project.candidateMatches.map(c => ({
        employeeId: c.employeeId,
        name: `${c.employee.firstName} ${c.employee.lastName || ''}`.trim(),
        email: c.employee.user.email,
        department: c.employee.department,
        skillIndex: c.skillIndex,
        matchPercentage: c.matchPercentage
      }))
    });

  } catch (error) {
    console.error('Error fetching project details:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch project details',
      details: error.message 
    });
  }
}

module.exports = {
  analyzeProject,
  getProjectCandidates,
  selectEmployees,
  getMyRequests,
  approveAssignment,
  getAllProjects,
  getProjectDetails
};
