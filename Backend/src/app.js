const express = require('express');
const app = express();
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const skillRoutes = require('./routes/skillRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const projectRoutes = require('./routes/projectRoutes');

// Middleware
app.use(express.json());
app.use(cors());

// Register routes
app.use('/api/auth', authRoutes);              // Authentication (register, login)
app.use('/api/employees', employeeRoutes);     // Employee management
app.use('/api/skills', skillRoutes);           // Skill management (HR only for CUD)
app.use('/api/ratings', ratingRoutes);         // Skill ratings (employee + manager)
app.use('/api/admin', adminRoutes);            // Admin functions (role assignment)
app.use('/api/projects', projectRoutes);       // Project management (AI-powered matching)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
