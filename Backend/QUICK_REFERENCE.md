# 🚀 Quick Reference Card - Employee Skill Rating System

## 📋 Roles & Permissions

| Role | Key Permissions |
|------|----------------|
| **EMPLOYEE** | ✅ Self-rate skills (1-5)<br>✅ View own ratings<br>❌ Cannot approve ratings<br>❌ Cannot manage skills |
| **MANAGER** | ✅ View team data<br>✅ Approve/reject/modify ratings<br>✅ View pending approvals<br>❌ Cannot manage skills |
| **HR** | ✅ Create/update/delete skills<br>✅ View all employees under them<br>❌ Cannot approve ratings<br>❌ Cannot change roles |
| **ADMIN** | ✅ Change user roles<br>✅ Assign managers/HR<br>✅ View all users<br>✅ Full system access |

---

## 🔑 Quick API Reference

### **Authentication**
```bash
# Register (default role: EMPLOYEE)
POST /api/auth/register
{ "email": "", "password": "", "firstName": "" }

# Login
POST /api/auth/login
{ "email": "", "password": "" }
```

### **Employee Self-Rating**
```bash
# Self-rate skill
POST /api/ratings/self-rate
Authorization: Bearer {token}
{ "skillId": 1, "selfRating": 4, "selfComments": "..." }

# View my ratings
GET /api/ratings/my-ratings
```

### **Manager Approval**
```bash
# Get pending approvals
GET /api/ratings/pending

# Approve/reject/modify
PUT /api/ratings/approve/:id
{ "managerStatus": "APPROVED", "managerRating": 4, "managerComments": "..." }
```

### **HR Skill Management**
```bash
# Create skill
POST /api/skills
{ "name": "JavaScript", "category": "Programming", "description": "..." }

# Update skill
PUT /api/skills/:id
{ "name": "JavaScript ES6+" }

# Delete skill
DELETE /api/skills/:id
```

### **Admin Role Assignment**
```bash
# Change user role
PUT /api/admin/users/:userId/role
{ "role": "MANAGER" }

# Assign manager
PUT /api/admin/employees/:employeeId/assign-manager
{ "managerId": 2 }

# Assign HR
PUT /api/admin/employees/:employeeId/assign-hr
{ "hrId": 3 }

# System stats
GET /api/admin/stats
```

---

## 🎬 5-Minute Demo Flow

### **Step 1: Setup (1 min)**
```
1. Register 4 users (all start as EMPLOYEE)
   - john.employee@company.com
   - sarah.manager@company.com
   - lisa.hr@company.com
   - admin@company.com
```

### **Step 2: Admin Setup (1 min)**
```
1. Login as admin@company.com
2. Change sarah to MANAGER role
3. Change lisa to HR role
4. Assign sarah as manager to john
5. Assign lisa as HR to john & sarah
```

### **Step 3: HR Creates Skills (1 min)**
```
1. Login as lisa.hr@company.com
2. Create skill: JavaScript
3. Create skill: Python
4. Create skill: React
```

### **Step 4: Employee Rates (1 min)**
```
1. Login as john.employee@company.com
2. View available skills (public)
3. Self-rate JavaScript: 4/5
4. Add comment: "3 years experience..."
5. View my ratings → Status: PENDING
```

### **Step 5: Manager Approves (1 min)**
```
1. Login as sarah.manager@company.com
2. View pending approvals → See john's rating
3. Approve with change: 3/5
4. Add comment: "Good progress..."
5. John can now see approved rating
```

---

## 🧪 Test Checklist

- [ ] ✅ Register works (default EMPLOYEE)
- [ ] ✅ Admin can change roles
- [ ] ✅ Admin can assign hierarchy
- [ ] ✅ HR can create skills
- [ ] ✅ HR can modify skills
- [ ] ✅ HR can delete skills
- [ ] ✅ Employee can self-rate (1-5)
- [ ] ✅ Manager sees pending approvals
- [ ] ✅ Manager can approve
- [ ] ✅ Manager can modify rating
- [ ] ✅ Manager can reject
- [ ] ✅ Employee sees approved rating
- [ ] ❌ Employee CANNOT create skill (403)
- [ ] ❌ Manager CANNOT delete skill (403)
- [ ] ❌ Employee CANNOT change role (403)

---

## 🔒 Access Control

### **Rating Workflow**
```
EMPLOYEE     → Self-rate (1-5)
             ↓
MANAGER      → View pending
             → Approve/Reject/Modify
             ↓
EMPLOYEE     → View approved rating with feedback
```

### **Skill Management**
```
HR           → Create skill
             → Modify skill
             → Delete skill
             ↓
PUBLIC       → View all skills (no auth needed)
```

### **Role Management**
```
ADMIN        → Change any user role
             → EMPLOYEE → MANAGER
             → EMPLOYEE → HR
             → MANAGER → HR
```

---

## 📊 Database Quick View

```sql
-- View all users with roles
SELECT email, role FROM User;

-- View employees with managers
SELECT 
  e.firstName as Employee,
  m.firstName as Manager,
  h.firstName as HR
FROM Employee e
LEFT JOIN Employee m ON e.managerId = m.userId
LEFT JOIN Employee h ON e.hrId = h.userId;

-- View skill ratings
SELECT 
  e.firstName,
  s.name as Skill,
  es.selfRating,
  es.managerRating,
  es.managerStatus
FROM EmployeeSkill es
JOIN Employee e ON es.employeeId = e.id
JOIN Skill s ON es.skillId = s.id;
```

---

## ⚡ Common Commands

```powershell
# Reset database
Remove-Item prisma/dev.db -ErrorAction SilentlyContinue
npx prisma db push

# Start server
node src/app.js

# Generate Prisma client
npx prisma generate

# View database
npx prisma studio
```

---

## 🎯 Rating Scale

```
1 ⭐ = Beginner (Basic knowledge)
2 ⭐⭐ = Developing (Some experience)
3 ⭐⭐⭐ = Competent (Can work independently)
4 ⭐⭐⭐⭐ = Proficient (Advanced skills)
5 ⭐⭐⭐⭐⭐ = Expert (Master level)
```

---

## 📝 Status Values

### **Manager Status**
- `PENDING` - Waiting for manager approval
- `APPROVED` - Manager approved the rating
- `REJECTED` - Manager rejected, needs revision

---

## 🔍 Debugging Tips

### **403 Forbidden Error**
→ Check if user has correct role assigned by admin

### **401 Unauthorized**
→ Ensure Authorization header: `Bearer {token}`

### **404 Not Found**
→ Verify IDs exist (skillId, employeeId, ratingId)

### **400 Bad Request**
→ Check rating is 1-5, required fields present

---

## 📚 Files to Check

- `README_NEW.md` - Full documentation
- `MIGRATION_GUIDE_NEW.md` - Migration steps
- `IMPLEMENTATION_SUMMARY_NEW.md` - Complete summary
- `Postman_Collection_New.json` - API testing
- `schema.prisma` - Database schema

---

## 🎉 Success Indicators

✅ Server starts without errors
✅ Database created successfully
✅ Postman collection runs end-to-end
✅ All roles can perform their functions
✅ Access control blocks unauthorized actions
✅ Rating workflow completes successfully

---

## 🚨 Remember

1. **Everyone starts as EMPLOYEE** - Admin changes roles
2. **Skills are public** - No auth needed to view
3. **Manager approval is final** - No multi-level approval
4. **One rating per skill** - Unique constraint (employee, skill)
5. **Cascade deletion** - Deleting user deletes employee & ratings

---

**Server:** http://localhost:4000
**Health Check:** http://localhost:4000/health
**Prisma Studio:** `npx prisma studio`

---

**Last Updated:** November 13, 2025
**Quick Ref Version:** 2.0
