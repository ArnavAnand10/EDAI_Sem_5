const express = require('express')
const app = express()
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const employeeRoutes = require('./routes/employeeRoutes')
const companyRoutes = require('./routes/companyRoutes')
const skillRoutes = require('./routes/skillRoutes')
const adminRoutes = require('./routes/adminRoutes');

// Admin routes

app.use(express.json())
app.use(cors())

// Auth routes
app.use('/api/auth', authRoutes)

// User routes
app.use('/api/users', userRoutes)

// Employee routes
app.use('/api/employees', employeeRoutes)

// Company routes
app.use('/api/companies', companyRoutes)

// Admin routes
app.use('/api/admins', adminRoutes);

// Skill routes
app.use('/api/skills', skillRoutes)

// EmployeeSkill routes

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
