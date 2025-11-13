# Database Migration Guide

## Overview
This guide helps you migrate from the old schema to the new role-based access control system with skill ratings.

## ⚠️ Important Warnings

The new schema includes breaking changes:
1. **Drops `manager` column** from Employee table (replaced with `managerId`)
2. **Drops `level` column** from EmployeeSkill table (replaced with rating system)
3. **Changes User roles** from `ADMIN|EMPLOYEE` to `EMPLOYEE|MANAGER|MANAGER_MANAGER|HR_ADMIN|SYSTEM_ADMIN`

## Migration Options

### Option 1: Fresh Start (Recommended for Development)

If you don't need existing data:

```powershell
cd Backend

# Delete existing database
Remove-Item prisma\dev.db

# Create fresh migration
npx prisma migrate dev --name initial_rbac_system

# Run seed (if available)
npx prisma db seed
```

### Option 2: Manual Data Migration (For Production)

If you need to preserve existing data:

#### Step 1: Export Existing Data

```powershell
cd Backend

# Create a backup
npx prisma db push --skip-generate
node -e "
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function backup() {
  const data = {
    users: await prisma.user.findMany(),
    employees: await prisma.employee.findMany(),
    companies: await prisma.company.findMany(),
    skills: await prisma.skill.findMany(),
    employeeSkills: await prisma.employeeSkill.findMany()
  };
  
  fs.writeFileSync('backup.json', JSON.stringify(data, null, 2));
  console.log('Backup created: backup.json');
  await prisma.$disconnect();
}

backup();
"
```

#### Step 2: Apply New Schema

```powershell
# Reset database with new schema
npx prisma migrate reset --force

# Apply new migration
npx prisma migrate dev --name add_role_based_access_and_rating_system
```

#### Step 3: Migrate Data

Create a file `migrate-data.js` in Backend folder:

```javascript
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function migrateData() {
  try {
    // Read backup
    const backup = JSON.parse(fs.readFileSync('backup.json', 'utf8'));
    
    console.log('Migrating users...');
    // Migrate users - convert ADMIN to HR_ADMIN
    for (const user of backup.users) {
      const newRole = user.role === 'ADMIN' ? 'HR_ADMIN' : 'EMPLOYEE';
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          password: user.password,
          role: newRole,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      });
    }
    
    console.log('Migrating companies...');
    // Migrate companies (no changes)
    for (const company of backup.companies) {
      await prisma.company.create({
        data: company
      });
    }
    
    console.log('Migrating skills...');
    // Migrate skills - add default weightage
    for (const skill of backup.skills) {
      await prisma.skill.create({
        data: {
          id: skill.id,
          name: skill.name,
          category: skill.category,
          weightage: 5, // Default weightage
          createdAt: new Date(skill.createdAt),
          updatedAt: new Date(skill.updatedAt)
        }
      });
    }
    
    console.log('Migrating employees...');
    // Migrate employees - convert manager string to managerId
    for (const emp of backup.employees) {
      await prisma.employee.create({
        data: {
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          department: emp.department,
          contactInfo: emp.contactInfo,
          position: null, // New field
          dateOfJoining: null, // New field
          location: null, // New field
          companyId: emp.companyId,
          adminId: emp.adminId,
          userId: emp.userId,
          managerId: null, // TODO: Map from old manager field if needed
          managerManagerId: null, // New field
          createdAt: new Date(emp.createdAt),
          updatedAt: new Date(emp.updatedAt)
        }
      });
    }
    
    console.log('Migrating employee skills...');
    // Migrate employee skills - convert level to rating
    const levelToRating = {
      'Beginner': 2,
      'Intermediate': 3,
      'Advanced': 4,
      'Expert': 5
    };
    
    for (const empSkill of backup.employeeSkills) {
      const selfRating = levelToRating[empSkill.level] || 3;
      const isApproved = empSkill.status === 'APPROVED';
      
      await prisma.employeeSkill.create({
        data: {
          employeeId: empSkill.employeeId,
          skillId: empSkill.skillId,
          selfRating: selfRating,
          selfComments: `Migrated from ${empSkill.level}`,
          managerRating: isApproved ? selfRating : null,
          managerStatus: isApproved ? 'APPROVED' : 'PENDING',
          managerApprovedAt: isApproved ? new Date(empSkill.updatedAt) : null,
          finalRating: isApproved ? selfRating : null,
          status: empSkill.status === 'APPROVED' ? 'APPROVED' : 
                  empSkill.status === 'REJECTED' ? 'REJECTED' : 'PENDING',
          requestedAt: new Date(empSkill.requestedAt),
          updatedAt: new Date(empSkill.updatedAt)
        }
      });
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
```

Run the migration script:

```powershell
node migrate-data.js
```

### Option 3: Development with Test Data

Create a new seed file for testing:

Create `Backend/prisma/seed-rbac.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create test company
  const company = await prisma.company.create({
    data: {
      name: 'Tech Corp',
      industry: 'Technology',
      location: 'San Francisco'
    }
  });
  
  // Create system admin
  const systemAdminUser = await prisma.user.create({
    data: {
      email: 'admin@techcorp.com',
      password: await argon2.hash('admin123'),
      role: 'SYSTEM_ADMIN'
    }
  });
  
  // Create HR admin
  const hrUser = await prisma.user.create({
    data: {
      email: 'hr@techcorp.com',
      password: await argon2.hash('hr123'),
      role: 'HR_ADMIN'
    }
  });
  
  const hrEmployee = await prisma.employee.create({
    data: {
      firstName: 'Alice',
      lastName: 'HR Manager',
      department: 'Human Resources',
      position: 'HR Manager',
      contactInfo: 'alice@techcorp.com',
      companyId: company.id,
      userId: hrUser.id,
      adminId: systemAdminUser.id
    }
  });
  
  // Create manager's manager
  const mmUser = await prisma.user.create({
    data: {
      email: 'director@techcorp.com',
      password: await argon2.hash('director123'),
      role: 'MANAGER_MANAGER'
    }
  });
  
  const mmEmployee = await prisma.employee.create({
    data: {
      firstName: 'Bob',
      lastName: 'Director',
      department: 'Engineering',
      position: 'Engineering Director',
      contactInfo: 'bob@techcorp.com',
      companyId: company.id,
      userId: mmUser.id,
      adminId: systemAdminUser.id
    }
  });
  
  // Create manager
  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@techcorp.com',
      password: await argon2.hash('manager123'),
      role: 'MANAGER'
    }
  });
  
  const managerEmployee = await prisma.employee.create({
    data: {
      firstName: 'Carol',
      lastName: 'Manager',
      department: 'Engineering',
      position: 'Engineering Manager',
      contactInfo: 'carol@techcorp.com',
      companyId: company.id,
      userId: managerUser.id,
      adminId: systemAdminUser.id,
      managerManagerId: mmEmployee.id
    }
  });
  
  // Create employee
  const empUser = await prisma.user.create({
    data: {
      email: 'employee@techcorp.com',
      password: await argon2.hash('emp123'),
      role: 'EMPLOYEE'
    }
  });
  
  const employee = await prisma.employee.create({
    data: {
      firstName: 'David',
      lastName: 'Developer',
      department: 'Engineering',
      position: 'Software Engineer',
      dateOfJoining: new Date('2023-01-15'),
      contactInfo: 'david@techcorp.com',
      location: 'San Francisco',
      companyId: company.id,
      userId: empUser.id,
      adminId: systemAdminUser.id,
      managerId: managerEmployee.id,
      managerManagerId: mmEmployee.id
    }
  });
  
  // Create skills
  const skills = await Promise.all([
    prisma.skill.create({ data: { name: 'JavaScript', category: 'Programming', weightage: 8 } }),
    prisma.skill.create({ data: { name: 'Python', category: 'Programming', weightage: 8 } }),
    prisma.skill.create({ data: { name: 'React', category: 'Frontend', weightage: 7 } }),
    prisma.skill.create({ data: { name: 'Node.js', category: 'Backend', weightage: 7 } }),
    prisma.skill.create({ data: { name: 'SQL', category: 'Database', weightage: 6 } })
  ]);
  
  // Create employee skill with self-rating
  await prisma.employeeSkill.create({
    data: {
      employeeId: employee.id,
      skillId: skills[0].id,
      selfRating: 4,
      selfComments: '3 years of experience with JavaScript',
      status: 'IN_REVIEW'
    }
  });
  
  console.log('✅ Seed completed!');
  console.log('\nTest Accounts:');
  console.log('System Admin: admin@techcorp.com / admin123');
  console.log('HR Admin: hr@techcorp.com / hr123');
  console.log('Director (MM): director@techcorp.com / director123');
  console.log('Manager: manager@techcorp.com / manager123');
  console.log('Employee: employee@techcorp.com / emp123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run the seed:

```powershell
node prisma/seed-rbac.js
```

## Post-Migration Tasks

1. **Update all ADMIN users to appropriate roles**:
   - HR administrators → HR_ADMIN
   - System administrators → SYSTEM_ADMIN
   - Team leads → MANAGER
   - Department heads → MANAGER_MANAGER

2. **Set up reporting relationships**:
   - Assign managerId for all employees
   - Assign managerManagerId where applicable

3. **Update skill weightage**:
   - Review all skills
   - Set appropriate weightage (1-10)

4. **Test the system**:
   - Login with different roles
   - Test demographic protection
   - Test skill rating workflow
   - Verify manager approval workflow

## Troubleshooting

### Issue: Migration fails with foreign key constraint
**Solution**: Delete existing database and start fresh (Option 1)

### Issue: Cannot login after migration
**Solution**: Check if user roles were properly migrated. Update manually:
```sql
UPDATE User SET role = 'HR_ADMIN' WHERE role = 'ADMIN';
```

### Issue: Employees don't see their managers
**Solution**: Properly set managerId and managerManagerId fields in Employee table

## Rollback

If you need to rollback:

```powershell
cd Backend

# Revert to previous migration
npx prisma migrate resolve --rolled-back <migration-name>

# Restore from backup
# (Use your backup.json and reverse migration script)
```

## Summary

Choose your migration path:
- **Development**: Use Option 1 (Fresh Start) or Option 3 (Test Data)
- **Production**: Use Option 2 (Manual Data Migration)

Always backup your data before migration!
