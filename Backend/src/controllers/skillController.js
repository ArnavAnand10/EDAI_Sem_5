const prisma = require('../config/prisma')

// ----------------- Admin: Create global skill -----------------
async function createSkill(req, res) {
	try {
		const { name, category } = req.body
		if (!name)
			return res.status(400).json({ error: 'Skill name is required' })

		const existing = await prisma.skill.findUnique({ where: { name } })
		if (existing)
			return res.status(400).json({ error: 'Skill already exists' })

		const skill = await prisma.skill.create({
			data: { name, category: category || null },
		})
		res.status(201).json(skill)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// ----------------- Get all skills (public) -----------------
async function getSkills(req, res) {
	try {
		const skills = await prisma.skill.findMany({
			include: { _count: { select: { employeeSkills: true } } },
		})
		res.json(skills)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// ----------------- Employee: Request a skill -----------------
async function requestSkill(req, res) {
	try {
		const { skillId, level } = req.body
		if (!skillId || !level)
			return res
				.status(400)
				.json({ error: 'skillId and level are required' })

		const employee = await prisma.employee.findUnique({
			where: { userId: req.user.userId },
		})
		if (!employee)
			return res.status(404).json({ error: 'Employee not found' })

		const request = await prisma.employeeSkill.create({
			data: {
				employeeId: employee.id,
				skillId,
				level,
				status: 'PENDING',
			},
		})

		res.status(201).json(request)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// ----------------- Admin: Approve/Reject employee skill -----------------
async function updateEmployeeSkillStatus(req, res) {
	try {
		const { id } = req.params // EmployeeSkill ID
		const { status } = req.body // APPROVED / REJECTED

		if (!['APPROVED', 'REJECTED'].includes(status)) {
			return res.status(400).json({ error: 'Invalid status' })
		}

		const employeeSkill = await prisma.employeeSkill.findUnique({
			where: { id: parseInt(id) },
		})
		if (!employeeSkill)
			return res.status(404).json({ error: 'EmployeeSkill not found' })

		// Optional: Only allow admin of the employee to update
		const employee = await prisma.employee.findUnique({
			where: { id: employeeSkill.employeeId },
		})
		if (!employee || employee.adminId !== req.user.userId) {
			return res.status(403).json({ error: 'Not authorized' })
		}

		const updated = await prisma.employeeSkill.update({
			where: { id: parseInt(id) },
			data: { status },
		})

		res.json(updated)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// ----------------- Employee: View own skills -----------------
async function getMySkills(req, res) {
	try {
		const employee = await prisma.employee.findUnique({
			where: { userId: req.user.userId },
		})
		if (!employee)
			return res.status(404).json({ error: 'Employee not found' })

		const skills = await prisma.employeeSkill.findMany({
			where: { employeeId: employee.id },
			include: { skill: true },
		})

		res.json(skills)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// ----------------- Admin: View all employees' skill requests -----------------
async function getAllEmployeeSkillRequests(req, res) {
	try {
		const requests = await prisma.employeeSkill.findMany({
			where: {
				employee: { adminId: req.user.userId }, // Only for employees under this admin
			},
			include: { employee: true, skill: true },
		})
		res.json(requests)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Internal server error' })
	}
}

module.exports = {
	createSkill,
	getSkills,
	requestSkill,
	updateEmployeeSkillStatus,
	getMySkills,
	getAllEmployeeSkillRequests,
}
