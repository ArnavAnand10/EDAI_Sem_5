# 🚀 AI Project Assignment - Quick API Reference

## 🔐 Authentication
All endpoints require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📍 New Endpoints

### **1. Create Project with AI Analysis** 
`POST /api/projects/analyze` 🔒 **HR/ADMIN**

**Request:**
```json
{
  "name": "Project Name",
  "description": "Natural language project requirements..."
}
```

**Response:**
```json
{
  "project": {"id": 1, "name": "...", "status": "OPEN"},
  "skillAnalysis": {
    "matched": 5,
    "missing": 2,
    "matchedSkills": [{"geminiName": "ReactJS", "dbName": "React", "weight": 90}],
    "missingSkills": [{"name": "Docker", "weight": 60}]
  },
  "candidates": [
    {"employeeId": 5, "name": "John Doe", "skillIndex": 412.5}
  ]
}
```

---

### **2. Get Project Candidates**
`GET /api/projects/:id/candidates` 🔒 **HR/ADMIN**

**Response:**
```json
{
  "project": {"id": 1, "name": "...", "requiredSkills": [...]},
  "candidates": [
    {
      "employeeId": 5,
      "name": "John Doe",
      "skillIndex": 412.5,
      "matchPercentage": 100,
      "missingSkills": []
    }
  ]
}
```

---

### **3. Select Employees for Project**
`POST /api/projects/:id/select-employees` 🔒 **HR/ADMIN**

**Request:**
```json
{
  "employeeIds": [5, 8, 12]
}
```

**Response:**
```json
{
  "message": "3 employees selected for approval",
  "assignments": [
    {
      "assignmentId": 1,
      "employeeId": 5,
      "employeeName": "John Doe",
      "managerId": 3,
      "status": "PENDING"
    }
  ]
}
```

---

### **4. Manager Views Pending Requests**
`GET /api/projects/my/requests` 🔒 **MANAGER**

**Response:**
```json
{
  "totalRequests": 2,
  "requests": [
    {
      "assignmentId": 1,
      "projectName": "E-commerce Platform",
      "employee": {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "status": "PENDING"
    }
  ]
}
```

---

### **5. Manager Approves/Rejects Assignment**
`PUT /api/projects/assignments/:id/approve` 🔒 **MANAGER**

**Request:**
```json
{
  "action": "APPROVE",
  "comments": "Perfect fit for this project!"
}
```
_Or `"action": "REJECT"` to reject_

**Response:**
```json
{
  "message": "Assignment approved successfully",
  "assignment": {
    "status": "APPROVED",
    "comments": "Perfect fit...",
    "approvedAt": "2025-11-14T11:00:00Z"
  }
}
```

---

### **6. List All Projects**
`GET /api/projects` 🔒 **HR/ADMIN**

**Response:**
```json
{
  "totalProjects": 3,
  "projects": [
    {
      "id": 1,
      "name": "E-commerce Platform",
      "status": "OPEN",
      "candidatesCount": 5,
      "assignmentsCount": 3,
      "pendingApprovals": 1
    }
  ]
}
```

---

### **7. Get Project Details**
`GET /api/projects/:id` 🔒 **HR/ADMIN**

**Response:**
```json
{
  "id": 1,
  "name": "E-commerce Platform",
  "requiredSkills": [...],
  "assignments": [
    {
      "employee": {"name": "John Doe"},
      "status": "APPROVED",
      "comments": "..."
    }
  ],
  "allCandidates": [...]
}
```

---

## 🔄 Updated Endpoints

### **Skill Management** (now with weights)

#### Get All Skills
`GET /api/skills` 🔓 **PUBLIC**

**Response for EMPLOYEE:**
```json
[
  {
    "id": 1,
    "name": "React",
    "category": "Frontend"
    // NO weight field
  }
]
```

**Response for MANAGER/HR/ADMIN:**
```json
[
  {
    "id": 1,
    "name": "React",
    "category": "Frontend",
    "weight": 85  // ✅ Weight visible
  }
]
```

---

#### Create Skill (HR Only)
`POST /api/skills` 🔒 **HR/ADMIN**

**Request:**
```json
{
  "name": "React",
  "category": "Frontend",
  "description": "Modern UI library",
  "weight": 85
}
```

---

#### Update Skill (HR Only)
`PUT /api/skills/:id` 🔒 **HR/ADMIN**

**Request:**
```json
{
  "weight": 90
}
```

---

## 📊 Key Concepts

### **Skill Index Formula**
```
Skill Index = Σ(project_weight × employee_rating) / count(project_skills)
```

**Example:**
- React (weight: 90, rating: 5) → 450
- Node.js (weight: 85, rating: 4) → 340
- MongoDB (weight: 80, rating: 5) → 400
- **Total**: (450 + 340 + 400) / 3 = **396.67**

---

### **Skill Matching Examples**

| Gemini Extracts | Database Has | Result |
|-----------------|--------------|---------|
| ReactJS | React | ✅ Matched |
| Node | Node.js | ✅ Matched |
| JS | JavaScript | ✅ Matched |
| MongoDB | Mongo | ✅ Matched |
| Docker | - | ❌ Missing |

---

## 🎯 Complete Workflow Example

### **1. HR Creates Project**
```bash
POST /api/projects/analyze
{
  "name": "Mobile App",
  "description": "Build iOS/Android app with React Native, Firebase, and push notifications."
}
```

### **2. HR Views Candidates**
```bash
GET /api/projects/1/candidates
# Returns ranked employees by skill index
```

### **3. HR Selects Top 3**
```bash
POST /api/projects/1/select-employees
{"employeeIds": [5, 8, 12]}
```

### **4. Manager Gets Notification (via API)**
```bash
GET /api/projects/my/requests
# Manager sees pending approval for their team member
```

### **5. Manager Approves**
```bash
PUT /api/projects/assignments/1/approve
{"action": "APPROVE", "comments": "Great fit!"}
```

---

## 🔒 Role Permissions

| Endpoint | EMPLOYEE | MANAGER | HR | ADMIN |
|----------|----------|---------|-----|-------|
| POST /projects/analyze | ❌ | ❌ | ✅ | ✅ |
| GET /projects/:id/candidates | ❌ | ❌ | ✅ | ✅ |
| POST /projects/:id/select | ❌ | ❌ | ✅ | ✅ |
| GET /projects/my/requests | ❌ | ✅ | ❌ | ❌ |
| PUT /assignments/:id/approve | ❌ | ✅ | ❌ | ❌ |
| GET /skills (with weight) | ❌ | ✅ | ✅ | ✅ |

---

## ⚙️ Environment Setup

Required in `.env`:
```bash
GEMINI_API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret
PORT=4000
```

Get Gemini API key: https://makersuite.google.com/app/apikey

---

## 🐛 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Gemini API key not configured" | Missing env var | Add GEMINI_API_KEY to .env |
| "No candidates found" | No employees have ALL skills | Have employees rate required skills |
| "Employee has no manager" | Manager not assigned | Admin assigns manager first |
| "Already assigned to project" | Duplicate selection | Skip this employee |
| "Not authorized" | Wrong manager | Only employee's manager can approve |

---

## 📚 Documentation Files

- **AI_PROJECT_FEATURE_GUIDE.md** - Complete feature documentation
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details
- **AI_FEATURE_TESTING_GUIDE.md** - 25+ test cases
- **API_QUICK_REFERENCE.md** - This file

---

**Base URL:** `http://localhost:4000`
**Current Version:** 1.0.0
**Status:** ✅ Production Ready
