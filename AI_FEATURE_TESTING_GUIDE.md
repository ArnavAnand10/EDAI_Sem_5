# 🧪 AI Project Assignment - Testing Checklist

## ⚙️ Prerequisites

### 1. Setup Environment
- [ ] Copy `.env.example` to `.env`
- [ ] Add your Gemini API key to `.env`: `GEMINI_API_KEY=your_key_here`
- [ ] Verify JWT_SECRET is set in `.env`
- [ ] Run `npx prisma db push` to update database
- [ ] Run `npx prisma generate` to generate Prisma client
- [ ] Install packages: `npm install` (should have @google/generative-ai)

### 2. Start Server
```bash
cd Backend
node src/app.js
# Should see: "Server running on port 4000"
```

### 3. Prepare Test Data
You need:
- [ ] 1 HR user
- [ ] 2-3 Manager users
- [ ] 5+ Employee users with skills
- [ ] 5+ Skills in database (React, Node.js, Python, etc.)
- [ ] Employees must have manager assignments
- [ ] Employees must have rated skills (approved by manager)

---

## 🧪 Test Suite

### **Test 1: Skill Weight Management (HR Only)**

#### 1.1: Create Skill with Weight
```bash
POST http://localhost:4000/api/skills
Authorization: Bearer <HR_TOKEN>
Content-Type: application/json

{
  "name": "React",
  "category": "Frontend",
  "description": "Modern UI library",
  "weight": 85
}
```

**Expected Result:**
```json
{
  "id": 1,
  "name": "React",
  "category": "Frontend",
  "description": "Modern UI library",
  "weight": 85,
  "createdAt": "2025-11-14T..."
}
```

#### 1.2: Update Skill Weight
```bash
PUT http://localhost:4000/api/skills/1
Authorization: Bearer <HR_TOKEN>
Content-Type: application/json

{
  "weight": 90
}
```

**Expected Result:**
```json
{
  "id": 1,
  "name": "React",
  "weight": 90
}
```

#### 1.3: Employee Views Skills (No Weight)
```bash
GET http://localhost:4000/api/skills
Authorization: Bearer <EMPLOYEE_TOKEN>
```

**Expected Result:**
```json
[
  {
    "id": 1,
    "name": "React",
    "category": "Frontend",
    "description": "Modern UI library",
    "createdAt": "2025-11-14T..."
    // NO weight field!
  }
]
```

#### 1.4: Manager Views Skills (With Weight)
```bash
GET http://localhost:4000/api/skills
Authorization: Bearer <MANAGER_TOKEN>
```

**Expected Result:**
```json
[
  {
    "id": 1,
    "name": "React",
    "weight": 90
    // Weight field visible!
  }
]
```

**✅ Test 1 Pass Criteria:**
- HR can create/update skills with weight ✓
- Employee cannot see weight field ✓
- Manager/HR/Admin can see weight field ✓

---

### **Test 2: AI-Powered Project Creation**

#### 2.1: Create Project with Natural Language
```bash
POST http://localhost:4000/api/projects/analyze
Authorization: Bearer <HR_TOKEN>
Content-Type: application/json

{
  "name": "E-commerce Platform Development",
  "description": "We need to build a modern e-commerce website using React for the frontend, Node.js and Express for the backend API, and MongoDB for database. The project requires expertise in RESTful API design, JWT authentication, payment gateway integration (Stripe), and AWS deployment. Experience with Docker containerization is highly valued."
}
```

**Expected Result:**
```json
{
  "message": "Project analyzed successfully",
  "project": {
    "id": 1,
    "name": "E-commerce Platform Development",
    "status": "OPEN",
    "createdAt": "2025-11-14T..."
  },
  "skillAnalysis": {
    "total": 8,
    "matched": 6,
    "missing": 2,
    "matchedSkills": [
      {"geminiName": "React", "dbName": "React", "weight": 95},
      {"geminiName": "Node.js", "dbName": "Node.js", "weight": 90},
      {"geminiName": "MongoDB", "dbName": "MongoDB", "weight": 85},
      {"geminiName": "RESTful API", "dbName": "REST API", "weight": 80},
      {"geminiName": "JWT", "dbName": "JWT Authentication", "weight": 75},
      {"geminiName": "AWS", "dbName": "AWS", "weight": 70}
    ],
    "missingSkills": [
      {"name": "Stripe", "weight": 65},
      {"name": "Docker", "weight": 60}
    ]
  },
  "candidates": [
    {
      "employeeId": 5,
      "name": "John Doe",
      "email": "john@example.com",
      "department": "Engineering",
      "position": "Senior Developer",
      "skillIndex": 487.5,
      "matchPercentage": 100,
      "missingSkills": []
    },
    {
      "employeeId": 8,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "skillIndex": 423.8,
      "matchPercentage": 100,
      "missingSkills": []
    }
  ]
}
```

**✅ Test 2.1 Pass Criteria:**
- Project created successfully ✓
- Gemini extracts 6-10 skills with weights ✓
- Skills matched to database dynamically ✓
- Missing skills tracked ✓
- Candidates ranked by skill index ✓
- Only employees with ALL matched skills shown ✓

#### 2.2: Test Skill Name Variations
Create project with variations:
```json
{
  "name": "Test Variations",
  "description": "Need ReactJS, Node, JavaScript, Mongo, and Python ML experience."
}
```

**Expected Matching:**
- "ReactJS" → "React" ✓
- "Node" → "Node.js" ✓
- "JavaScript" → "JavaScript" ✓
- "Mongo" → "MongoDB" ✓
- "Python ML" → "Python" OR missing ✓

**✅ Test 2.2 Pass Criteria:**
- Common abbreviations matched ✓
- Variations handled correctly ✓

---

### **Test 3: View Project Candidates**

#### 3.1: Get Ranked Candidates
```bash
GET http://localhost:4000/api/projects/1/candidates
Authorization: Bearer <HR_TOKEN>
```

**Expected Result:**
```json
{
  "project": {
    "id": 1,
    "name": "E-commerce Platform Development",
    "status": "OPEN",
    "requiredSkills": [
      {"name": "React", "weight": 95, "isMissing": false},
      {"name": "Node.js", "weight": 90, "isMissing": false},
      {"name": "Stripe", "weight": 65, "isMissing": true}
    ]
  },
  "candidates": [
    {
      "employeeId": 5,
      "name": "John Doe",
      "skillIndex": 487.5,
      "matchPercentage": 100,
      "missingSkills": []
    }
  ],
  "totalCandidates": 2
}
```

**✅ Test 3.1 Pass Criteria:**
- Candidates sorted by skillIndex DESC ✓
- Shows required skills with weights ✓
- Identifies missing skills ✓
- Shows match percentage ✓

#### 3.2: Verify Skill Index Calculation
Manually verify top candidate:

**If employee has:**
- React: 5/5 (weight: 95)
- Node.js: 4/5 (weight: 90)
- MongoDB: 5/5 (weight: 85)
- REST API: 4/5 (weight: 80)
- JWT: 5/5 (weight: 75)
- AWS: 3/5 (weight: 70)

**Manual Calculation:**
```
Skill Index = (95×5 + 90×4 + 85×5 + 80×4 + 75×5 + 70×3) / 6
            = (475 + 360 + 425 + 320 + 375 + 210) / 6
            = 2165 / 6
            = 360.83
```

**✅ Test 3.2 Pass Criteria:**
- Calculated skill index matches formula ✓
- Only project-relevant skills used ✓
- Employee's other skills ignored ✓

---

### **Test 4: Employee Selection**

#### 4.1: HR Selects Top 3 Employees
```bash
POST http://localhost:4000/api/projects/1/select-employees
Authorization: Bearer <HR_TOKEN>
Content-Type: application/json

{
  "employeeIds": [5, 8, 12]
}
```

**Expected Result:**
```json
{
  "message": "3 employees selected for approval",
  "assignments": [
    {
      "assignmentId": 1,
      "employeeId": 5,
      "employeeName": "John Doe",
      "employeeEmail": "john@example.com",
      "managerId": 3,
      "status": "PENDING"
    },
    {
      "assignmentId": 2,
      "employeeId": 8,
      "employeeName": "Jane Smith",
      "employeeEmail": "jane@example.com",
      "managerId": 4,
      "status": "PENDING"
    },
    {
      "assignmentId": 3,
      "employeeId": 12,
      "employeeName": "Bob Johnson",
      "employeeEmail": "bob@example.com",
      "managerId": 3,
      "status": "PENDING"
    }
  ]
}
```

**✅ Test 4.1 Pass Criteria:**
- All 3 employees assigned ✓
- Each has correct manager ✓
- Status is PENDING ✓
- Assignments stored in database ✓

#### 4.2: Try to Select Same Employee Twice
```bash
POST http://localhost:4000/api/projects/1/select-employees
Authorization: Bearer <HR_TOKEN>
Content-Type: application/json

{
  "employeeIds": [5]
}
```

**Expected Result:**
```json
{
  "message": "0 employees selected for approval",
  "assignments": [],
  "errors": [
    {
      "employeeId": 5,
      "error": "Employee already assigned to this project"
    }
  ]
}
```

**✅ Test 4.2 Pass Criteria:**
- Duplicate assignment prevented ✓
- Error message returned ✓

#### 4.3: Try to Select Employee Without Manager
Create employee without manager, then try to assign:

**Expected Result:**
```json
{
  "errors": [
    {
      "employeeId": 99,
      "error": "Employee has no assigned manager"
    }
  ]
}
```

**✅ Test 4.3 Pass Criteria:**
- Assignment blocked ✓
- Clear error message ✓

---

### **Test 5: Manager Approval Workflow**

#### 5.1: Manager Views Pending Requests
```bash
GET http://localhost:4000/api/projects/my/requests
Authorization: Bearer <MANAGER_TOKEN>
```

**Expected Result:**
```json
{
  "totalRequests": 2,
  "requests": [
    {
      "assignmentId": 1,
      "projectId": 1,
      "projectName": "E-commerce Platform Development",
      "projectDescription": "We need to build...",
      "employee": {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com",
        "department": "Engineering",
        "position": "Senior Developer"
      },
      "status": "PENDING",
      "requestedAt": "2025-11-14T10:30:00Z"
    }
  ]
}
```

**✅ Test 5.1 Pass Criteria:**
- Manager sees only THEIR team's requests ✓
- Shows project details ✓
- Shows employee details ✓
- Only PENDING requests shown ✓

#### 5.2: Manager Approves Assignment
```bash
PUT http://localhost:4000/api/projects/assignments/1/approve
Authorization: Bearer <MANAGER_TOKEN>
Content-Type: application/json

{
  "action": "APPROVE",
  "comments": "John is perfect for this project. He has extensive experience with React and Node.js."
}
```

**Expected Result:**
```json
{
  "message": "Assignment approved successfully",
  "assignment": {
    "id": 1,
    "projectName": "E-commerce Platform Development",
    "employeeName": "John Doe",
    "status": "APPROVED",
    "comments": "John is perfect for this project...",
    "approvedAt": "2025-11-14T11:00:00Z"
  }
}
```

**✅ Test 5.2 Pass Criteria:**
- Assignment status updated to APPROVED ✓
- Comments saved ✓
- Timestamp recorded ✓

#### 5.3: Manager Rejects Assignment
```bash
PUT http://localhost:4000/api/projects/assignments/2/approve
Authorization: Bearer <MANAGER_TOKEN>
Content-Type: application/json

{
  "action": "REJECT",
  "comments": "Jane is currently committed to another critical project."
}
```

**Expected Result:**
```json
{
  "message": "Assignment rejected successfully",
  "assignment": {
    "status": "REJECTED",
    "comments": "Jane is currently committed..."
  }
}
```

**✅ Test 5.3 Pass Criteria:**
- Assignment status updated to REJECTED ✓
- Comments saved ✓

#### 5.4: Try to Approve Already Approved Assignment
```bash
PUT http://localhost:4000/api/projects/assignments/1/approve
Authorization: Bearer <MANAGER_TOKEN>
Content-Type: application/json

{
  "action": "APPROVE"
}
```

**Expected Result:**
```json
{
  "error": "Assignment already approved"
}
```

**✅ Test 5.4 Pass Criteria:**
- Duplicate approval prevented ✓
- Clear error message ✓

#### 5.5: Try to Approve Another Manager's Team Member
Login as Manager B, try to approve Manager A's request:

**Expected Result:**
```json
{
  "error": "You are not authorized to approve this assignment"
}
```

**✅ Test 5.5 Pass Criteria:**
- Authorization check works ✓
- Manager can only approve own team ✓

---

### **Test 6: All Projects View (HR)**

#### 6.1: List All Projects
```bash
GET http://localhost:4000/api/projects
Authorization: Bearer <HR_TOKEN>
```

**Expected Result:**
```json
{
  "totalProjects": 2,
  "projects": [
    {
      "id": 1,
      "name": "E-commerce Platform Development",
      "description": "We need to build...",
      "status": "OPEN",
      "createdAt": "2025-11-14T...",
      "requiredSkillsCount": 8,
      "candidatesCount": 5,
      "assignmentsCount": 3,
      "pendingApprovals": 1
    }
  ]
}
```

**✅ Test 6.1 Pass Criteria:**
- All projects listed ✓
- Shows counts ✓
- Shows pending approvals ✓

#### 6.2: Get Project Details
```bash
GET http://localhost:4000/api/projects/1
Authorization: Bearer <HR_TOKEN>
```

**Expected Result:**
```json
{
  "id": 1,
  "name": "E-commerce Platform Development",
  "status": "OPEN",
  "requiredSkills": [...],
  "assignments": [
    {
      "id": 1,
      "employee": {...},
      "status": "APPROVED",
      "comments": "John is perfect...",
      "approvedAt": "2025-11-14T..."
    }
  ],
  "allCandidates": [...]
}
```

**✅ Test 6.2 Pass Criteria:**
- Full project details shown ✓
- Assignment status visible ✓
- All candidates listed ✓

---

### **Test 7: Role-Based Access Control**

#### 7.1: Employee Tries to Create Project
```bash
POST http://localhost:4000/api/projects/analyze
Authorization: Bearer <EMPLOYEE_TOKEN>
Content-Type: application/json

{
  "name": "Test Project",
  "description": "Test"
}
```

**Expected Result:**
```json
{
  "error": "Access denied. HR role required."
}
```

**✅ Test 7.1 Pass Criteria:**
- Access denied ✓
- Clear error message ✓

#### 7.2: Employee Tries to View Candidates
```bash
GET http://localhost:4000/api/projects/1/candidates
Authorization: Bearer <EMPLOYEE_TOKEN>
```

**Expected Result:**
```json
{
  "error": "Access denied. HR role required."
}
```

**✅ Test 7.2 Pass Criteria:**
- Access denied ✓

#### 7.3: Manager Tries to Select Employees
```bash
POST http://localhost:4000/api/projects/1/select-employees
Authorization: Bearer <MANAGER_TOKEN>
Content-Type: application/json

{
  "employeeIds": [5]
}
```

**Expected Result:**
```json
{
  "error": "Access denied. HR role required."
}
```

**✅ Test 7.3 Pass Criteria:**
- Manager cannot select employees ✓
- Only HR/Admin can select ✓

---

### **Test 8: Edge Cases**

#### 8.1: Project with No Qualified Candidates
Create project requiring skills that no employee has:

```json
{
  "name": "Quantum Computing Research",
  "description": "Need expertise in quantum algorithms, superconducting circuits, and cryogenic systems."
}
```

**Expected Result:**
```json
{
  "candidates": [],
  "totalCandidates": 0
}
```

**✅ Test 8.1 Pass Criteria:**
- Empty candidates array ✓
- No errors thrown ✓

#### 8.2: Project with All Missing Skills
Create project with skills not in DB:

```json
{
  "name": "Future Tech",
  "description": "Need expertise in QuantumJS, HyperReact, and NanoSQL."
}
```

**Expected Result:**
```json
{
  "skillAnalysis": {
    "matched": 0,
    "missing": 3,
    "missingSkills": [
      {"name": "QuantumJS", "weight": 90},
      {"name": "HyperReact", "weight": 85},
      {"name": "NanoSQL", "weight": 80}
    ]
  },
  "candidates": []
}
```

**✅ Test 8.2 Pass Criteria:**
- All skills marked as missing ✓
- No candidates (expected) ✓
- No errors thrown ✓

#### 8.3: Employee Partially Qualified
Employee has 2 out of 3 required skills:

**Expected Result:**
- Employee NOT in candidates list ✓
- Only employees with ALL skills shown ✓

#### 8.4: Gemini API Key Missing
Remove GEMINI_API_KEY from .env, then create project:

**Expected Result:**
```json
{
  "error": "Failed to analyze project",
  "details": "Gemini API key not configured. Please set GEMINI_API_KEY in .env file"
}
```

**✅ Test 8.4 Pass Criteria:**
- Clear error message ✓
- Doesn't crash server ✓

---

## 📊 Test Results Summary

Fill this out as you test:

| Test | Status | Notes |
|------|--------|-------|
| 1.1 Create skill with weight | ⬜ | |
| 1.2 Update skill weight | ⬜ | |
| 1.3 Employee sees no weight | ⬜ | |
| 1.4 Manager sees weight | ⬜ | |
| 2.1 AI project creation | ⬜ | |
| 2.2 Skill name variations | ⬜ | |
| 3.1 Get ranked candidates | ⬜ | |
| 3.2 Verify skill index | ⬜ | |
| 4.1 Select employees | ⬜ | |
| 4.2 Duplicate prevention | ⬜ | |
| 4.3 No manager check | ⬜ | |
| 5.1 View pending requests | ⬜ | |
| 5.2 Approve assignment | ⬜ | |
| 5.3 Reject assignment | ⬜ | |
| 5.4 Duplicate approval | ⬜ | |
| 5.5 Authorization check | ⬜ | |
| 6.1 List all projects | ⬜ | |
| 6.2 Project details | ⬜ | |
| 7.1 Employee blocked | ⬜ | |
| 7.2 Employee blocked | ⬜ | |
| 7.3 Manager blocked | ⬜ | |
| 8.1 No candidates | ⬜ | |
| 8.2 All missing skills | ⬜ | |
| 8.3 Partial qualification | ⬜ | |
| 8.4 Missing API key | ⬜ | |

**Legend:** ⬜ Not tested | ✅ Pass | ❌ Fail

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module @google/generative-ai"
**Solution:** Run `npm install @google/generative-ai`

### Issue: "GEMINI_API_KEY not configured"
**Solution:** 
1. Get API key from https://makersuite.google.com/app/apikey
2. Add to `.env`: `GEMINI_API_KEY=your_key`
3. Restart server

### Issue: "No candidates found"
**Cause:** No employees have ALL required skills
**Solution:**
1. Check which skills are matched/missing in response
2. Have employees rate those skills
3. Manager must approve ratings

### Issue: "Employee has no assigned manager"
**Solution:** Admin must assign manager:
```bash
POST /api/admin/assign-manager
{"employeeId": 5, "managerId": 3}
```

### Issue: Gemini returns wrong skills
**Cause:** Project description too vague
**Solution:** Be more specific:
- ❌ "Need web development"
- ✅ "Need React frontend, Node.js REST API, MongoDB database"

---

## ✅ Final Checklist

Before marking complete:
- [ ] All 25+ tests passed
- [ ] No server crashes during testing
- [ ] Skill weights hidden from employees
- [ ] Skill index calculation verified manually
- [ ] Manager approval workflow works end-to-end
- [ ] Role-based access control enforced
- [ ] Edge cases handled gracefully
- [ ] Gemini API integration working
- [ ] Documentation reviewed and accurate

---

**Happy Testing! 🚀**
