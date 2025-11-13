# 📘 Employee Skill Rating System - Complete Guide

## 🎯 System Overview

A simplified role-based employee skill rating system with 4 roles and a clear workflow hierarchy.

### **Role Hierarchy**
```
ADMIN (Super Admin)
  ├── HR (Human Resources)
  │   ├── MANAGER
  │   │   └── EMPLOYEE
  │   └── EMPLOYEE
  └── Direct management of all roles
```

---

## 👥 Role Definitions

### 1. **EMPLOYEE** (Default Role)
- Everyone starts as an EMPLOYEE when they register
- Can self-rate their skills (1-5 scale)
- Can view their own profile and ratings
- **Cannot** create, modify, or delete skills
- **Cannot** change anyone's role
- **Cannot** approve ratings

### 2. **MANAGER**
- Can view all employees under them (direct reports)
- Can view pending skill ratings from their team
- Can **approve**, **reject**, or **modify** employee skill ratings
- Can add comments to ratings
- **Cannot** create, modify, or delete skills
- **Cannot** change anyone's role

### 3. **HR** (Human Resources)
- Can view all employees and managers under them
- Can **create new skills**
- Can **modify existing skills**
- Can **delete skills**
- Can view all employee data under their jurisdiction
- **Cannot** change anyone's role

### 4. **ADMIN** (Super Administrator)
- **Full system access**
- Can view all employees, managers, and HR personnel
- Can **change any user's role** (EMPLOYEE → MANAGER → HR)
- Can **assign managers** to employees
- Can **assign HR** to employees/managers
- Can view system statistics
- Has complete visibility across the entire organization

---

## 🔄 Complete Workflow

### **Phase 1: Initial Setup (ADMIN)**
1. System Admin logs in
2. Admin assigns MANAGER role to selected employees
3. Admin assigns HR role to selected employees
4. Admin assigns reporting relationships:
   - Assign managers to employees
   - Assign HR to employees/managers

### **Phase 2: Skill Creation (HR)**
1. HR logs in
2. HR creates skills with:
   - Skill name (e.g., "JavaScript")
   - Category (e.g., "Programming Languages")
   - Description

### **Phase 3: Employee Self-Rating (EMPLOYEE)**
1. Employee logs in
2. Employee views available skills
3. Employee selects a skill and rates themselves (1-5)
4. Employee adds comments about their experience
5. Rating status: **PENDING** (waiting for manager approval)

### **Phase 4: Manager Review (MANAGER)**
1. Manager logs in
2. Manager views pending skill ratings from direct reports
3. Manager can:
   - **Approve** (keep employee's rating)
   - **Approve with changes** (modify the rating 1-5)
   - **Reject** (send back for re-submission)
4. Manager adds feedback comments
5. Rating status: **APPROVED** or **REJECTED**

### **Phase 5: View Results (EMPLOYEE)**
1. Employee logs in
2. Employee views their ratings
3. Approved ratings show:
   - Self-rating
   - Manager's rating (if changed)
   - Manager's comments
   - Approval status

---

## 📊 Database Schema

### User Table
```
- id (PK)
- email (unique)
- password (hashed)
- role (EMPLOYEE|MANAGER|HR|ADMIN)
- createdAt
- updatedAt
```

### Employee Table
```
- id (PK)
- firstName
- lastName
- department
- contactInfo
- position
- dateOfJoining
- location
- userId (FK → User, unique)
- managerId (FK → User.id of manager)
- hrId (FK → User.id of HR)
- createdAt
- updatedAt
```

### Skill Table
```
- id (PK)
- name (unique)
- category
- description
- createdAt
- updatedAt
```

### EmployeeSkill Table (Ratings)
```
- id (PK)
- employeeId (FK → Employee)
- skillId (FK → Skill)
- selfRating (1-5, required)
- selfComments (optional)
- managerRating (1-5, optional - set by manager)
- managerComments (optional)
- managerStatus (PENDING|APPROVED|REJECTED)
- managerApprovedAt
- managerApprovedBy (FK → User.id)
- createdAt
- updatedAt
- UNIQUE(employeeId, skillId)
```

---

## 🔌 API Endpoints

### **Authentication**
```
POST /api/auth/register    - Register new user (default role: EMPLOYEE)
POST /api/auth/login       - Login and get JWT token
```

### **Employee Management**
```
GET  /api/employees/me           - Get my profile
GET  /api/employees              - Get employees (based on role)
GET  /api/employees/:id          - Get employee by ID
PUT  /api/employees/:id          - Update employee (ADMIN only)
DELETE /api/employees/:id        - Delete employee (ADMIN only)
```

### **Skill Management**
```
GET    /api/skills           - Get all skills (public)
GET    /api/skills/:id       - Get skill by ID (public)
POST   /api/skills           - Create skill (HR only)
PUT    /api/skills/:id       - Update skill (HR only)
DELETE /api/skills/:id       - Delete skill (HR only)
```

### **Skill Ratings**
```
POST /api/ratings/self-rate      - Employee self-rates skill
GET  /api/ratings/my-ratings     - Get my ratings
GET  /api/ratings/pending        - Get pending approvals (MANAGER)
PUT  /api/ratings/approve/:id    - Approve/reject rating (MANAGER)
GET  /api/ratings/team           - Get team ratings (MANAGER)
```

### **Admin Functions**
```
GET /api/admin/users                           - Get all users
PUT /api/admin/users/:userId/role              - Change user role
PUT /api/admin/employees/:id/assign-manager    - Assign manager to employee
PUT /api/admin/employees/:id/assign-hr         - Assign HR to employee
GET /api/admin/stats                           - Get system statistics
```

---

## 🚀 Setup Instructions

### 1. **Install Dependencies**
```bash
cd Backend
npm install
```

### 2. **Reset Database (Fresh Start)**
```bash
# Delete old database
Remove-Item prisma/dev.db -ErrorAction SilentlyContinue
Remove-Item prisma/dev.db-journal -ErrorAction SilentlyContinue

# Generate Prisma client
npx prisma generate

# Create new database with schema
npx prisma db push
```

### 3. **Start Server**
```bash
npm start
```
Server runs on `http://localhost:4000`

### 4. **Import Postman Collection**
- Open Postman
- Click Import
- Select `Backend/Postman_Collection_New.json`
- Collection includes all endpoints organized by workflow

---

## 🎬 Quick Demo Script (5 Minutes)

### **Minute 1: Setup**
```
1. Register 4 users (all start as EMPLOYEE)
   - john.employee@company.com
   - sarah.manager@company.com
   - lisa.hr@company.com
   - admin@company.com
```

### **Minute 2: Admin Assigns Roles**
```
1. Login as Admin
2. Change sarah to MANAGER role
3. Change lisa to HR role
4. Assign sarah as manager to john
5. Assign lisa as HR to john and sarah
```

### **Minute 3: HR Creates Skills**
```
1. Login as HR (lisa)
2. Create skills:
   - JavaScript
   - Python
   - React
3. Verify skills are public (view without auth)
```

### **Minute 4: Employee Self-Rates**
```
1. Login as Employee (john)
2. View available skills
3. Self-rate JavaScript: 4/5
4. Add comments about experience
5. View "my-ratings" (status: PENDING)
```

### **Minute 5: Manager Approves**
```
1. Login as Manager (sarah)
2. View pending approvals
3. Approve john's JavaScript rating
4. Option: Change rating to 3/5 with feedback
5. John can now see approved rating with manager comments
```

---

## 🧪 Testing Checklist

### ✅ **Role Assignment Tests**
- [ ] Admin can change EMPLOYEE → MANAGER
- [ ] Admin can change EMPLOYEE → HR
- [ ] Admin can assign manager to employee
- [ ] Admin can assign HR to employee
- [ ] Non-admin CANNOT change roles (403 error)

### ✅ **Skill Management Tests**
- [ ] HR can create new skills
- [ ] HR can update existing skills
- [ ] HR can delete skills
- [ ] EMPLOYEE cannot create skills (403 error)
- [ ] MANAGER cannot delete skills (403 error)
- [ ] Anyone can VIEW skills (public)

### ✅ **Rating Workflow Tests**
- [ ] Employee can self-rate (1-5)
- [ ] Employee sees only their own ratings
- [ ] Manager sees only direct reports' pending ratings
- [ ] Manager can approve rating (keep same)
- [ ] Manager can approve with changed rating
- [ ] Manager can reject rating
- [ ] Employee cannot approve own rating

### ✅ **Access Control Tests**
- [ ] Employee can only see their own profile
- [ ] Manager can only see direct reports
- [ ] HR can only see employees under them
- [ ] Admin can see everyone
- [ ] Unauthorized access returns 401/403

---

## 🔒 Security Features

1. **JWT Authentication**: All protected endpoints require Bearer token
2. **Role-Based Access Control**: Middleware checks user role before allowing access
3. **Password Hashing**: Argon2 hashing for secure password storage
4. **Unique Constraints**: Email and skill names are unique
5. **Cascade Deletion**: Deleting user cascades to employee and ratings
6. **Foreign Key Relationships**: Proper relational integrity

---

## 📈 Key Metrics (Admin Dashboard)

- Total users by role
- Total employees
- Total skills
- Total ratings
- Pending approvals count
- Employees by department

---

## 🛠️ Troubleshooting

### **Problem: "P2025: Record not found"**
**Solution**: Make sure you're using correct IDs from collection variables

### **Problem: "403 Forbidden"**
**Solution**: Check that user has correct role assigned by admin

### **Problem: "Token missing"**
**Solution**: Ensure Authorization header is set: `Bearer <token>`

### **Problem: Migration errors**
**Solution**: Delete database and run `npx prisma db push` for fresh start

---

## 📝 Notes

1. **Everyone starts as EMPLOYEE** - Only admin can change roles
2. **Skills are public** - Anyone can view, only HR can manage
3. **Manager ratings are final** - No multi-level approval needed
4. **Ratings are unique** - One employee can rate each skill only once
5. **Cascade relationships** - Deleting user deletes employee and ratings

---

## 🎓 Best Practices

1. **Always run requests in order** when testing workflow
2. **Save collection variables** (tokens, IDs) for easy testing
3. **Use meaningful comments** when rating skills
4. **Admin should assign roles immediately** after registration
5. **HR should create skills before** employees start rating

---

**Ready to test!** Import the Postman collection and run the workflow from Section 1. 🚀
