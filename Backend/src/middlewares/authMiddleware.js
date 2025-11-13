const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

// Authenticate JWT token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { userId, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// Role-based middleware - simplified 4 roles: EMPLOYEE, MANAGER, HR, ADMIN
function isEmployee(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  // All authenticated users can access employee endpoints
  next();
}

function isManager(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (req.user.role !== "MANAGER" && req.user.role !== "HR" && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Manager access required" });
  }
  next();
}

function isHR(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (req.user.role !== "HR" && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "HR access required" });
  }
  next();
}

function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

module.exports = { 
  authenticateToken,
  isEmployee,
  isManager,
  isHR,
  isAdmin
};
