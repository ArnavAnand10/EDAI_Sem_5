# 🔄 Migration Guide - New Simplified Structure

## Overview

This guide explains how to migrate from the old complex system to the new simplified 4-role system.

---

## 🆕 What Changed?

### **Role Structure**
**OLD (5 roles):**
- EMPLOYEE
- MANAGER
- MANAGER_MANAGER
- HR_ADMIN
- SYSTEM_ADMIN

**NEW (4 roles):**
- EMPLOYEE (default)
- MANAGER
- HR
- ADMIN

### **Key Simplifications**

1. **No Manager's Manager** - Single-level approval only
2. **No Company Model** - Removed company relationships
3. **Simplified Hierarchy** - Employee → Manager → HR → Admin
4. **managerId is now userId** - Direct reference to User table
5. **No adminId required** - Removed legacy admin tracking
6. **Default Role** - Everyone registers as EMPLOYEE
7. **No weightage** - Removed skill weightage field
8. **Simpler Approval** - Manager approval is final (no multi-level)

---

## 📋 Database Migration Steps

### **Option 1: Fresh Start (Recommended for Development)**

```powershell
# 1. Backup old database (if needed)
Copy-Item prisma/dev.db prisma/dev.db.backup

# 2. Delete old database
Remove-Item prisma/dev.db -ErrorAction SilentlyContinue
Remove-Item prisma/dev.db-journal -ErrorAction SilentlyContinue

# 3. Generate Prisma client
npx prisma generate

# 4. Create new database
npx prisma db push

# 5. Start server
npm start
```

### **Option 2: Prisma Migrate (Production)**

```powershell
# 1. Create migration
npx prisma migrate dev --name simplified_structure

# 2. Review migration SQL in prisma/migrations folder

# 3. Apply migration
npx prisma migrate deploy

# 4. Start server
npm start
```

---

## 🗺️ Schema Migration Map

### **User Model Changes**
```diff
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String
- role      String    // Old: EMPLOYEE, MANAGER, MANAGER_MANAGER, HR_ADMIN, SYSTEM_ADMIN
+ role      String    @default("EMPLOYEE") // New: EMPLOYEE, MANAGER, HR, ADMIN
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

- employees  Employee[] @relation("AdminEmployees") // Removed
  employee   Employee?
}
```

### **Employee Model Changes**
```diff
model Employee {
  id              Int       @id @default(autoincrement())
  firstName       String
  lastName        String?
  department      String?
  contactInfo     String?
  position        String?
  dateOfJoining   DateTime?
  location        String?
- companyId       Int?       // Removed
- adminId         Int        // Removed
  userId          Int       @unique
- managerId       Int?       // Was employeeId reference
+ managerId       Int?       // Now userId reference
- managerManagerId Int?      // Removed
+ hrId            Int?       // New: HR assignment
  
- company        Company?   // Removed
- admin          User       // Removed
  user           User       @relation(...)
  
- manager        Employee?  // Old: Self-reference by employeeId
+ manager        Employee?  // New: Self-reference by userId
- managerManager Employee?  // Removed
+ hr             Employee?  // New: HR relationship
}
```

### **Skill Model Changes**
```diff
model Skill {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  category  String?
+ description String?  // New
- weightage Int       // Removed
}
```

### **EmployeeSkill Model Changes**
```diff
model EmployeeSkill {
  id                  Int      @id @default(autoincrement())
  employeeId          Int
  skillId             Int
  
- selfRating          Int?     // Old: Optional
+ selfRating          Int      // New: Required
  selfComments        String?
  
  managerRating       Int?
  managerComments     String?
- managerStatus       String   @default("PENDING") // Old: PENDING, APPROVED, REJECTED, MODIFIED
+ managerStatus       String   @default("PENDING") // New: PENDING, APPROVED, REJECTED (no MODIFIED)
  managerApprovedAt   DateTime?
+ managerApprovedBy   Int?     // New: Track who approved
  
- managerManagerRating    Int?      // Removed
- managerManagerComments  String?   // Removed
- managerManagerStatus    String    // Removed
- finalRating             Int?      // Removed
- status                  String    // Removed
- requestedAt             DateTime  // Removed
  
+ createdAt           DateTime @default(now())  // New
  updatedAt           DateTime @updatedAt
}
```

### **Removed Models**
```diff
- model Company { ... }          // Completely removed
- model AuditLog { ... }         // Completely removed
- model SystemBackup { ... }     // Completely removed
```

---

## 🔄 Data Migration Script

If you have existing data, use this script to migrate:

```javascript
// migrate-data.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateData() {
  console.log('Starting data migration...');

  try {
    // 1. Update user roles
    await prisma.$executeRaw`
      UPDATE User 
      SET role = CASE 
        WHEN role = 'SYSTEM_ADMIN' THEN 'ADMIN'
        WHEN role = 'HR_ADMIN' THEN 'HR'
        WHEN role = 'MANAGER_MANAGER' THEN 'MANAGER'
        ELSE role 
      END
    `;
    console.log('✅ User roles updated');

    // 2. Update employee manager references from employeeId to userId
    const employees = await prisma.employee.findMany({
      include: { manager: true }
    });

    for (const emp of employees) {
      if (emp.manager) {
        await prisma.employee.update({
          where: { id: emp.id },
          data: { managerId: emp.manager.userId }
        });
      }
    }
    console.log('✅ Manager references updated');

    // 3. Update EmployeeSkill - make selfRating required
    await prisma.$executeRaw`
      DELETE FROM EmployeeSkill WHERE selfRating IS NULL
    `;
    console.log('✅ Removed incomplete ratings');

    console.log('Migration complete! ✅');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
```

Run with: `node migrate-data.js`

---

## 🧪 Post-Migration Testing

### 1. **Verify Role Changes**
```sql
SELECT role, COUNT(*) as count 
FROM User 
GROUP BY role;

-- Should show: EMPLOYEE, MANAGER, HR, ADMIN only
```

### 2. **Verify Manager Links**
```sql
SELECT 
  e.firstName,
  m.firstName as managerName
FROM Employee e
LEFT JOIN Employee m ON e.managerId = m.userId;

-- All managerId should reference User.id not Employee.id
```

### 3. **Verify Ratings**
```sql
SELECT COUNT(*) FROM EmployeeSkill WHERE selfRating IS NULL;
-- Should return 0
```

---

## 📝 API Endpoint Changes

### **Changed Endpoints**

| Old Endpoint | New Endpoint | Notes |
|--------------|--------------|-------|
| `/api/admins/*` | `/api/admin/*` | Simplified admin routes |
| `/api/companies/*` | ❌ Removed | No company management |
| `/api/users/*` | ❌ Removed | User management in admin |
| `/api/search/*` | ❌ Removed | Simplified reporting |
| `/api/system/*` | ❌ Removed | No system backups |

### **New Endpoints**

- `PUT /api/admin/users/:userId/role` - Change user role
- `PUT /api/admin/employees/:id/assign-manager` - Assign manager
- `PUT /api/admin/employees/:id/assign-hr` - Assign HR
- `GET /api/admin/stats` - System statistics

---

## 🔍 Testing Migration

### **1. Test Registration (New Users)**
```bash
POST /api/auth/register
{
  "email": "test@company.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}

# Verify: User created with role = "EMPLOYEE"
```

### **2. Test Role Assignment**
```bash
# Login as admin
POST /api/auth/login

# Change role to MANAGER
PUT /api/admin/users/:userId/role
{
  "role": "MANAGER"
}

# Verify: User role changed
```

### **3. Test Skill Rating**
```bash
# Employee self-rates
POST /api/ratings/self-rate
{
  "skillId": 1,
  "selfRating": 4,
  "selfComments": "3 years experience"
}

# Manager approves
PUT /api/ratings/approve/:id
{
  "managerStatus": "APPROVED",
  "managerRating": 4,
  "managerComments": "Good work"
}
```

---

## ⚠️ Breaking Changes

### **1. Registration Changed**
**Old:** Required `role` and `adminId`
```json
{
  "email": "user@company.com",
  "password": "pass",
  "firstName": "John",
  "role": "EMPLOYEE",
  "adminId": 1
}
```

**New:** Everyone starts as EMPLOYEE
```json
{
  "email": "user@company.com",
  "password": "pass",
  "firstName": "John"
}
```

### **2. Manager Assignment**
**Old:** `managerId` was `Employee.id`
**New:** `managerId` is `User.id`

### **3. Removed Features**
- ❌ Company management
- ❌ Multi-level approval (Manager's Manager)
- ❌ System backups
- ❌ Audit logs
- ❌ Skill weightage

---

## 📚 Updated Documentation

- `README_NEW.md` - Complete system guide
- `Postman_Collection_New.json` - Updated API collection
- `schema.prisma` - New simplified schema

---

## 🎯 Rollback Plan

If migration fails:

```powershell
# 1. Restore backup
Copy-Item prisma/dev.db.backup prisma/dev.db -Force

# 2. Restore old code from git
git checkout HEAD -- src/

# 3. Restart server
npm start
```

---

## ✅ Migration Checklist

- [ ] Backup existing database
- [ ] Update Prisma schema
- [ ] Generate Prisma client
- [ ] Run migration (fresh or migrate)
- [ ] Update old user roles (if migrating data)
- [ ] Test registration (new users)
- [ ] Test role assignment (admin)
- [ ] Test skill creation (HR)
- [ ] Test self-rating (employee)
- [ ] Test approval (manager)
- [ ] Test all negative cases (access control)
- [ ] Import new Postman collection
- [ ] Run complete workflow test
- [ ] Verify all API endpoints work
- [ ] Update frontend (if applicable)

---

**Migration Status:** ✅ Ready for fresh start | ⚠️ Data migration requires script

**Recommended Approach:** Fresh database for development, data migration script for production
