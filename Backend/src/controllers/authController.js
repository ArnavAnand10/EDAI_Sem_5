const prisma = require('../config/prisma');
const { hashPassword, comparePassword } = require('../utils/hash');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';
const TOKEN_EXP = '7d';

// Register new user
async function register(req, res) {
  try {
    const { email, password, firstName, lastName, department, position, role } = req.body;

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

    // Validate role if provided
    const validRoles = ['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'];
    const userRole = role && validRoles.includes(role) ? role : 'EMPLOYEE';

    console.log('Registration request - role received:', role);
    console.log('Registration request - userRole to save:', userRole);

    // Create user with specified or default role
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashed, 
        role: userRole
      },
    });

    console.log('User created with role:', user.role);

    // Create employee profile (only for EMPLOYEE and MANAGER roles)
    let employee = null;
    if (userRole === 'EMPLOYEE' || userRole === 'MANAGER') {
      employee = await prisma.employee.create({
        data: {
          firstName,
          lastName: lastName || null,
          department: department || null,
          position: position || null,
          userId: user.id
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXP }
    );

    // Prepare response based on role
    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // Add employee data if it exists (EMPLOYEE, MANAGER)
    if (employee) {
      userResponse.employee = {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName
      };
    } else {
      // For HR and ADMIN, add firstName/lastName directly to user object
      userResponse.firstName = firstName;
      userResponse.lastName = lastName || '';
    }

    console.log('Sending registration response with role:', userResponse.role);

    res.status(201).json({
      user: userResponse,
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

    // Prepare user response
    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // If user has employee profile (EMPLOYEE, MANAGER)
    if (user.employee) {
      userResponse.employee = user.employee;
    } else {
      // For HR and ADMIN without employee records, use email as display name
      userResponse.firstName = user.email.split('@')[0]; // Fallback: use email prefix
      userResponse.lastName = '';
    }

    res.json({
      user: userResponse,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { register, login };
