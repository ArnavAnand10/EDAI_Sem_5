const prisma = require('../config/prisma');
const { hashPassword, comparePassword } = require('../utils/hash');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';
const TOKEN_EXP = '7d';

// Register new user (everyone starts as EMPLOYEE by default)
async function register(req, res) {
  try {
    const { email, password, firstName, lastName, department, position } = req.body;

    if (!email || !password || !firstName) {
      return res.status(400).json({ error: 'email, password, and firstName are required' });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const hashed = await hashPassword(password);

    // Create user with default EMPLOYEE role
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashed, 
        role: 'EMPLOYEE' // Default role
      },
    });

    // Create employee profile
    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName: lastName || null,
        department: department || null,
        position: position || null,
        userId: user.id
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXP }
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName
        }
      },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }

    // Find user with employee data
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        employee: {
          include: {
            manager: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            hr: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXP }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: user.employee
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { register, login };
