const prisma = require('../config/prisma');
const { hashPassword, comparePassword } = require('../utils/hash');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';
const TOKEN_EXP = '7d';

// --------------------- REGISTER ---------------------
async function register(req, res) {
  try {
    const { email, password, firstName, lastName, role, adminId } = req.body;

    if (!email || !password || !firstName || !role)
      return res.status(400).json({ error: 'email, password, firstName, and role are required' });

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    // Hash password
    const hashed = await hashPassword(password);

    // Create User
    const createdUser = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role,
      },
    });

    let employee = null;

    // If Employee, create Employee record
    if (role === 'EMPLOYEE') {
      employee = await prisma.employee.create({
        data: {
          firstName,
          lastName: lastName || null,
          adminId: adminId || null, // optional admin assignment
          user: { connect: { id: createdUser.id } }, // link to user
        },
      });
    }

    // Create JWT token
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
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// --------------------- LOGIN ---------------------
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'email and password required' });

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true, employees: true }, // include relations
    });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await comparePassword(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    // JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: TOKEN_EXP,
    });

    // Send response
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
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { register, login };
