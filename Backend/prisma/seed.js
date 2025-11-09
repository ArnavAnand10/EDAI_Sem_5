const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/hash');

const prisma = new PrismaClient();

async function main() {
  // Create a company
  const company = await prisma.company.create({
    data: {
      name: "Tech Solutions Inc",
      industry: "Technology",
      location: "New York, NY"
    }
  });

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: await hashPassword("admin123"),
      role: "ADMIN"
    }
  });

  // Create employee user
  const employeeUser = await prisma.user.create({
    data: {
      email: "john.doe@example.com",
      password: await hashPassword("employee123"),
      role: "EMPLOYEE"
    }
  });

  // Create employee profile
  const employee = await prisma.employee.create({
    data: {
      firstName: "John",
      lastName: "Doe",
      department: "Engineering",
      manager: "Jane Smith",
      companyId: company.id,
      adminId: adminUser.id,
      userId: employeeUser.id
    }
  });

  // Create some skills
  const skills = await prisma.skill.createMany({
    data: [
      { name: "JavaScript", category: "Programming" },
      { name: "React", category: "Frontend" },
      { name: "Node.js", category: "Backend" },
      { name: "Python", category: "Programming" },
      { name: "SQL", category: "Database" }
    ]
  });

  console.log('Seed data created successfully!');
  console.log('Admin Login: admin@example.com / admin123');
  console.log('Employee Login: john.doe@example.com / employee123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });