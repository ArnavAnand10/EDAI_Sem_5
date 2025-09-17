const prisma = require('../config/prisma');
const { hashPassword, comparePassword } = require('../utils/hash');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';
const TOKEN_EXP = '7d';

async function register(req, res) {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    if (!email || !password || !firstName)
      return res.status(400).json({ error: 'email, password and firstName required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hashed = await hashPassword(password);

    const createdUser = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: role || 'EMPLOYEE',
      },
    });

    const employee = await prisma.employee.create({
      data: { firstName, lastName: lastName || null },
    });

    await prisma.user.update({
      where: { id: createdUser.id },
      data: { employeeId: employee.id },
    });

    const token = jwt.sign(
      { userId: createdUser.id, role: createdUser.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXP }
    );

    res.status(201).json({
      user: { id: createdUser.id, email: createdUser.email, role: createdUser.role, employeeId: employee.id },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXP });

    res.json({
      user: { id: user.id, email: user.email, role: user.role, employeeId: user.employeeId },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { register, login };
