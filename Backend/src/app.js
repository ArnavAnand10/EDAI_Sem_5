const express = require('express');
const app = express();
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const employeeRoutes = require('./routes/employeeRoutes');
const companyRoutes = require('./routes/companyRoutes');
const skillRoutes = require("./routes/skillRoutes");
const employeeSkillRoutes = require("./routes/employeeSkillRoutes");
app.use(express.json());


app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/employee-skills', require('./routes/employeeSkillRoutes'));

app.use("/api/skills", skillRoutes);
app.use("/api/employee-skills", employeeSkillRoutes);

app.use('/api/employees', employeeRoutes);
app.use('/api/companies', companyRoutes);

app.use('/api/employees', employeeRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
