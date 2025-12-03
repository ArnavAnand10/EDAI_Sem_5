# 🚀 AI-Powered Project Assignment Feature

## 📋 Overview

This feature uses **Google Gemini AI** to intelligently match employees to projects based on:
- **AI-extracted skills** from project requirements
- **Dynamic skill name matching** (e.g., "ReactJS" matches "React" in DB)
- **Weighted skill scoring** based on project relevance
- **Manager approval workflow** for selected employees

---

## 🔑 Key Features

### 1. **AI-Powered Skill Extraction**
- HR inputs natural language project requirements
- Gemini AI extracts required skills with importance weights (1-100)
- System automatically matches extracted skills to existing database skills

### 2. **Smart Skill Matching**
- **Exact match**: "React" matches "React"
- **Partial match**: "ReactJS" matches "React"
- **Abbreviations**: "JS" matches "JavaScript", "Node" matches "Node.js"
- **Missing skills**: Tracks skills not found in database for HR review

### 3. **Skill Index Calculation**
- **Formula**: `Σ(project_weight × employee_rating) / count(project_skills)`
- **Only project-relevant skills** are considered
- **Employees without ALL required skills are excluded** from candidates
- Employees ranked by Skill Index (higher = better match)

### 4. **Manager Approval Workflow**
- HR selects top K employees from ranked candidates
- System creates approval request for each employee's manager
- Manager can APPROVE or REJECT with comments
- Real-time status tracking

---

## 🎯 Complete Workflow

### **Step 1: HR Creates Project** 
```
POST /api/projects/analyze
Authorization: Bearer <HR_TOKEN>
Content-Type: application/json

{
  "name": "E-commerce Website Development",
  "description": "We need to build a modern e-commerce platform using React for frontend, Node.js for backend, and MongoDB for database. The project requires expertise in RESTful API design, JWT authentication, and payment gateway integration. Experience with AWS deployment is highly valued."
}
```

**What Happens:**
1. ✅ Gemini AI analyzes requirements
2. ✅ Extracts skills: ReactJS (90), Node.js (85), MongoDB (80), REST API (75), JWT (70), AWS (65)
3. ✅ Matches to DB: React ✓, Node.js ✓, MongoDB ✓, REST API ✗ (missing)
4. ✅ Calculates Skill Index for all employees with ALL matched skills
5. ✅ Returns ranked candidates

**Response:**
```json
{
  "message": "Project analyzed successfully",
  "project": {
    "id": 1,
    "name": "E-commerce Website Development",
    "status": "OPEN"
  },
  "skillAnalysis": {
    "total": 6,
    "matched": 5,
    "missing": 1,
    "matchedSkills": [
      {"geminiName": "ReactJS", "dbName": "React", "weight": 90},
      {"geminiName": "Node.js", "dbName": "Node.js", "weight": 85}
    ],
    "missingSkills": [
      {"name": "REST API", "weight": 75}
    ]
  },
  "candidates": [
    {
      "employeeId": 5,
      "name": "John Doe",
      "email": "john@example.com",
      "department": "Engineering",
      "skillIndex": 412.5,
      "matchPercentage": 100,
      "missingSkills": []
    }
  ]
}
```

---

### **Step 2: HR Views Project Candidates**
```
GET /api/projects/1/candidates
Authorization: Bearer <HR_TOKEN>
```

**Response:**
```json
{
  "project": {
    "id": 1,
    "name": "E-commerce Website Development",
    "requiredSkills": [
      {"name": "React", "weight": 90, "isMissing": false},
      {"name": "Node.js", "weight": 85, "isMissing": false}
    ]
  },
  "candidates": [
    {
      "employeeId": 5,
      "name": "John Doe",
      "skillIndex": 412.5,
      "matchPercentage": 100,
      "missingSkills": []
    },
    {
      "employeeId": 8,
      "name": "Jane Smith",
      "skillIndex": 387.0,
      "matchPercentage": 100,
      "missingSkills": []
    }
  ],
  "totalCandidates": 2
}
```

---

### **Step 3: HR Selects Top Employees**
```
POST /api/projects/1/select-employees
Authorization: Bearer <HR_TOKEN>
Content-Type: application/json

{
  "employeeIds": [5, 8]
}
```

**What Happens:**
1. ✅ System creates approval request for Employee 5's manager
2. ✅ System creates approval request for Employee 8's manager
3. ✅ Requests sent with status "PENDING"

**Response:**
```json
{
  "message": "2 employees selected for approval",
  "assignments": [
    {
      "assignmentId": 1,
      "employeeId": 5,
      "employeeName": "John Doe",
      "managerId": 3,
      "status": "PENDING"
    },
    {
      "assignmentId": 2,
      "employeeId": 8,
      "employeeName": "Jane Smith",
      "managerId": 4,
      "status": "PENDING"
    }
  ]
}
```

---

### **Step 4: Manager Views Pending Requests**
```
GET /api/projects/my/requests
Authorization: Bearer <MANAGER_TOKEN>
```

**Response:**
```json
{
  "totalRequests": 2,
  "requests": [
    {
      "assignmentId": 1,
      "projectId": 1,
      "projectName": "E-commerce Website Development",
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

---

### **Step 5: Manager Approves/Rejects**
```
PUT /api/projects/assignments/1/approve
Authorization: Bearer <MANAGER_TOKEN>
Content-Type: application/json

{
  "action": "APPROVE",
  "comments": "John is a great fit for this project. Approved!"
}
```

**Response:**
```json
{
  "message": "Assignment approved successfully",
  "assignment": {
    "id": 1,
    "projectName": "E-commerce Website Development",
    "employeeName": "John Doe",
    "status": "APPROVED",
    "comments": "John is a great fit for this project. Approved!",
    "approvedAt": "2025-11-14T11:00:00Z"
  }
}
```

---

## 📊 Database Schema

### **New Tables:**

#### `Project`
```prisma
model Project {
  id                  Int      @id @default(autoincrement())
  name                String
  description         String   // Original requirements
  createdBy           Int      // HR userId
  status              String   @default("OPEN") // OPEN, IN_PROGRESS, COMPLETED
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

#### `ProjectSkillRequirement`
```prisma
model ProjectSkillRequirement {
  id                  Int      @id @default(autoincrement())
  projectId           Int
  skillId             Int?     // NULL if skill not in DB
  skillName           String   // From Gemini
  weight              Int      // 1-100 from Gemini
  isMissing           Boolean  @default(false)
}
```

#### `ProjectCandidateMatch`
```prisma
model ProjectCandidateMatch {
  id                  Int      @id @default(autoincrement())
  projectId           Int
  employeeId          Int
  skillIndex          Float    // Calculated score
  matchPercentage     Float
  missingSkills       String   // JSON array
}
```

#### `ProjectAssignment`
```prisma
model ProjectAssignment {
  id                  Int      @id @default(autoincrement())
  projectId           Int
  employeeId          Int
  managerId           Int      // Who approves
  selectedBy          Int      // HR who selected
  managerStatus       String   @default("PENDING") // PENDING, APPROVED, REJECTED
  managerComments     String?
  approvedAt          DateTime?
}
```

#### `Skill` (Updated)
```prisma
model Skill {
  id          Int     @id @default(autoincrement())
  name        String  @unique
  category    String?
  description String?
  weight      Int     @default(0)  // ⭐ NEW: Base weight (0-100)
}
```

---

## 🔧 Setup Instructions

### **1. Get Gemini API Key**
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

### **2. Configure Environment**
```bash
# Copy example file
cp .env.example .env

# Edit .env and add your Gemini API key
GEMINI_API_KEY=your_actual_api_key_here
JWT_SECRET=your_jwt_secret
PORT=4000
```

### **3. Apply Database Changes**
```bash
npx prisma db push
npx prisma generate
```

### **4. Start Server**
```bash
node src/app.js
# Server running on port 4000
```

---

## 🧪 Testing Guide

### **Test 1: Create Project with AI Analysis**
```bash
# Login as HR
POST http://localhost:4000/api/auth/login
{"email": "hr@example.com", "password": "password"}

# Create project
POST http://localhost:4000/api/projects/analyze
Authorization: Bearer <token>
{
  "name": "Mobile App Development",
  "description": "Build a React Native mobile app with Firebase backend. Need expertise in mobile UI/UX, real-time database, and push notifications."
}
```

### **Test 2: View Ranked Candidates**
```bash
GET http://localhost:4000/api/projects/1/candidates
Authorization: Bearer <HR_TOKEN>
```

### **Test 3: Select Top 3 Employees**
```bash
POST http://localhost:4000/api/projects/1/select-employees
Authorization: Bearer <HR_TOKEN>
{"employeeIds": [5, 8, 12]}
```

### **Test 4: Manager Approves**
```bash
# Login as Manager
POST http://localhost:4000/api/auth/login
{"email": "manager@example.com", "password": "password"}

# View requests
GET http://localhost:4000/api/projects/my/requests
Authorization: Bearer <MANAGER_TOKEN>

# Approve
PUT http://localhost:4000/api/projects/assignments/1/approve
Authorization: Bearer <MANAGER_TOKEN>
{"action": "APPROVE", "comments": "Perfect fit!"}
```

---

## 🎨 Skill Matching Examples

| Gemini Says | DB Has | Result |
|------------|---------|---------|
| ReactJS | React | ✅ Matched |
| Node.js | Node.js | ✅ Matched |
| JS | JavaScript | ✅ Matched |
| MongoDB | Mongo | ✅ Matched |
| Rest API | RESTful API | ✅ Matched |
| Python ML | - | ❌ Missing |

---

## 📈 Skill Index Calculation Example

**Project Requirements (from Gemini):**
- React (weight: 90)
- Node.js (weight: 85)
- MongoDB (weight: 80)

**Employee Skills (manager-approved ratings):**
- React: 5/5
- Node.js: 4/5
- MongoDB: 5/5

**Calculation:**
```
Skill Index = (90×5 + 85×4 + 80×5) / 3
            = (450 + 340 + 400) / 3
            = 1190 / 3
            = 396.67
```

**Employee with React:3, Node.js:5, MongoDB:4:**
```
Skill Index = (90×3 + 85×5 + 80×4) / 3
            = (270 + 425 + 320) / 3
            = 1015 / 3
            = 338.33
```

**Result:** First employee (396.67) ranks higher ✅

---

## 🚦 Role Permissions

| Endpoint | EMPLOYEE | MANAGER | HR | ADMIN |
|----------|----------|---------|-----|-------|
| POST /projects/analyze | ❌ | ❌ | ✅ | ✅ |
| GET /projects/:id/candidates | ❌ | ❌ | ✅ | ✅ |
| POST /projects/:id/select-employees | ❌ | ❌ | ✅ | ✅ |
| GET /projects/my/requests | ❌ | ✅ | ❌ | ❌ |
| PUT /projects/assignments/:id/approve | ❌ | ✅ | ❌ | ❌ |
| GET /projects | ❌ | ❌ | ✅ | ✅ |

---

## 🛠️ API Endpoints Summary

### **HR/Admin Endpoints**
- `POST /api/projects/analyze` - Create project with AI analysis
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details with assignments
- `GET /api/projects/:id/candidates` - View ranked candidates
- `POST /api/projects/:id/select-employees` - Select top K employees

### **Manager Endpoints**
- `GET /api/projects/my/requests` - View pending approval requests
- `PUT /api/projects/assignments/:id/approve` - Approve/reject assignment

### **Updated Endpoints**
- `GET /api/skills` - Now hides `weight` field from EMPLOYEE role
- `GET /api/skills/:id` - Now hides `weight` field from EMPLOYEE role
- `POST /api/skills` - Now accepts optional `weight` field (HR only)
- `PUT /api/skills/:id` - Now accepts optional `weight` field (HR only)

---

## 🐛 Troubleshooting

### **Error: "Gemini API key not configured"**
**Solution:** Add `GEMINI_API_KEY` to `.env` file

### **Error: "No candidates found"**
**Cause:** No employees have ALL required skills
**Solution:** 
1. Check which skills are matched/missing
2. Have employees rate required skills
3. Manager must approve ratings

### **Error: "Employee has no assigned manager"**
**Solution:** Admin must assign manager first:
```bash
POST /api/admin/assign-manager
{"employeeId": 5, "managerId": 3}
```

### **Gemini returns invalid JSON**
**Cause:** API response parsing issue
**Solution:** Retry request, service has auto-cleanup for markdown blocks

---

## 🎯 Best Practices

1. **Ensure all employees have managers** before using project assignments
2. **Have employees rate their skills** and get manager approval first
3. **HR should create skills** for common technologies before projects
4. **Use clear project descriptions** for better AI skill extraction
5. **Review missing skills** and create them if needed
6. **Set realistic skill weights** (1-100) for better matching

---

## 📝 Notes

- **Skill Index is only visible to MANAGER/HR/ADMIN roles**
- **Employees cannot see skill weights or their Skill Index**
- **Only employees with ALL required (non-missing) skills are shown as candidates**
- **Dynamic matching handles variations**: ReactJS → React, Node → Node.js
- **Manager approval is required** for each assignment
- **Project status** can be updated manually in database

---

## 🔄 Future Enhancements

- Email notifications for approval requests
- Skills gap analysis per employee
- Historical project assignment tracking
- Team composition recommendations
- Budget and timeline considerations
- Multi-project employee availability

---

**🎉 Feature Complete! Ready for Production Testing.**
