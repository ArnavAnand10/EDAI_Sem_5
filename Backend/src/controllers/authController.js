const prisma = require('../config/prisma');
const { hashPassword, comparePassword } = require('../utils/hash');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';
const TOKEN_EXP = '7d';
async function register(req, res) {
  try {
    const { email, password, firstName, lastName, role, adminId } = req.body;

    if (!email || !password || !firstName || !role)
      return res.status(400).json({ error: 'email, password, firstName, and role are required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hashed = await hashPassword(password);

    const createdUser = await prisma.user.create({
      data: { email, password: hashed, role },
    });

    let employee = null;

    if (role === 'EMPLOYEE') {
      if (!adminId) {
        return res.status(400).json({ error: 'adminId is required for employees' });
      }

      const admin = await prisma.user.findUnique({ where: { id: adminId } });
      if (!admin || admin.role !== 'ADMIN') {
        return res.status(400).json({ error: 'Invalid adminId. Must belong to an ADMIN user' });
      }

      employee = await prisma.employee.create({
        data: {
          firstName,
          lastName: lastName || null,
          admin: { connect: { id: adminId } },       // connect to ADMIN
          user: { connect: { id: createdUser.id } }, // link to User
        },
      });
    }

    const token = jwt.sign(
      { userId: createdUser.id, role: createdUser.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXP }
    );

    res.status(201).json({
      user: {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        employeeId: employee ? employee.id : null,
        adminId: employee ? employee.adminId : null,
      },
      token,
    });
  } catch (err) {
    console.error(' Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


// --------------------- LOGIN ---------------------
async function login(req, res) {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    if (!email || !password)
      return res.status(400).json({ error: 'email and password required' });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true, employees: true },
    });

    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      console.log("Invalid password for:", email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: TOKEN_EXP,
    });

    console.log("Login success:", email);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employee ? user.employee.id : null,
        adminId: user.employee ? user.employee.adminId : null,
        employeesUnderAdmin: user.role === 'ADMIN' ? user.employees : [],
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { register, login };
