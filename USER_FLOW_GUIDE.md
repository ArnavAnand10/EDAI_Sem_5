# SkillForge - Complete User Flow Documentation

## 🎯 Application Overview

SkillForge is a comprehensive employee skill management system with two distinct user roles:
1. **Employees** - Request skills and track their professional development
2. **Admins** - Manage employees and approve/reject skill requests

---

## 🔐 Authentication Flow

### User Registration
1. Navigate to **http://localhost:3001/auth/register**
2. Fill in registration form:
   - Full Name (First Name + Last Name)
   - Email address
   - Password
   - Role selection (Admin or Employee)
3. Submit form
4. System creates user account and automatically logs in
5. Redirects based on role:
   - Admin → `/admin`
   - Employee → `/dashboard`

### User Login
1. Navigate to **http://localhost:3001/auth/login**
2. Enter credentials:
   - Email
   - Password
3. Submit login form
4. System validates credentials
5. Returns JWT token and user data
6. Stores token and user info in localStorage
7. Redirects based on role:
   - Admin → `/admin`
   - Employee → `/dashboard`

---

## 👤 Employee User Flow

### 1. Login
```
URL: /auth/login
Credentials: john.doe@example.com / employee123
```

### 2. Employee Dashboard
**URL:** `/dashboard`

**What Employee Sees:**
- Navigation bar with:
  - SkillForge logo
  - Email display
  - Logout button
- **My Skills Card:**
  - List of all requested skills
  - Each skill shows:
    - Skill name
    - Level (e.g., Beginner, Intermediate, Expert)
    - Status badge (Pending/Approved/Rejected)
- **Request New Skills Card:**
  - Browse all available skills
  - Each skill shows:
    - Skill name
    - Category (if available)
    - "Request" button

### 3. Request a New Skill
**Action:** Click "Request" button next to a skill

**Process:**
1. Frontend sends POST request to `/api/skills/request`
2. Request body: `{ skillId: number, level: "Beginner" }`
3. Backend creates EmployeeSkill record with:
   - employeeId (from JWT token)
   - skillId
   - level
   - status: "PENDING" (default)
4. Frontend refreshes data
5. New skill appears in "My Skills" with "PENDING" status

### 4. Track Skill Status
**Status Types:**
- **PENDING** (Yellow badge) - Waiting for admin approval
- **APPROVED** (Green badge) - Admin has approved
- **REJECTED** (Red badge) - Admin has rejected

### 5. Logout
Click "Logout" button → Clears localStorage → Redirects to `/auth/login`

---

## 👨‍💼 Admin User Flow

### 1. Login
```
URL: /auth/login
Credentials: admin@example.com / admin123
```

### 2. Admin Dashboard
**URL:** `/admin`

**What Admin Sees:**
- Navigation bar with:
  - Shield icon + "SkillForge Admin"
  - Admin email
  - Logout button
- Two tabs:
  - **Employees** tab
  - **Skill Requests** tab

### 3. Employees Tab (Default View)
**Purpose:** View and manage all employees

**Displays:**
- Employee cards showing:
  - Full name (First Name + Last Name)
  - Email address
  - Department
  - Total number of skills

**API Call:** `GET /api/employees`
- Returns array of employees with:
  - Employee details
  - Associated user info
  - EmployeeSkills array

### 4. Skill Requests Tab
**Purpose:** Manage pending skill requests

**Displays:**
- Skill request cards showing:
  - Employee name
  - Employee email
  - Skill name
  - Skill level
  - Status badge
  - Action buttons (for PENDING requests):
    - ✓ Approve (Green)
    - ✗ Reject (Red)

**API Call:** `GET /api/skills/employee-skill-requests`
- Returns all EmployeeSkill records with:
  - Employee details
  - Skill details
  - Current status

### 5. Approve a Skill Request
**Action:** Click "Approve" button

**Process:**
1. Frontend sends PATCH request to `/api/skills/employee-skill-status`
2. Request body: `{ employeeSkillId: number, status: "APPROVED" }`
3. Backend updates EmployeeSkill record status
4. Frontend refreshes data
5. Status badge changes to green "APPROVED"
6. Action buttons disappear

### 6. Reject a Skill Request
**Action:** Click "Reject" button

**Process:**
1. Frontend sends PATCH request to `/api/skills/employee-skill-status`
2. Request body: `{ employeeSkillId: number, status: "REJECTED" }`
3. Backend updates EmployeeSkill record status
4. Frontend refreshes data
5. Status badge changes to red "REJECTED"
6. Action buttons disappear

### 7. Switch Between Tabs
- Click "Employees" tab → Shows employee list
- Click "Skill Requests" tab → Shows pending requests count in badge

---

## 🔄 Data Flow Diagrams

### Employee Skill Request Flow
```
Employee Dashboard
    ↓
Click "Request" on Skill
    ↓
POST /api/skills/request
    ↓
Create EmployeeSkill (status: PENDING)
    ↓
Save to Database
    ↓
Return updated skills
    ↓
Display in "My Skills" with PENDING badge
    ↓
Admin Reviews in Skill Requests Tab
    ↓
Admin Approves/Rejects
    ↓
PATCH /api/skills/employee-skill-status
    ↓
Update EmployeeSkill status
    ↓
Employee sees updated status
```

### Authentication Flow
```
Login Page
    ↓
Enter Credentials
    ↓
POST /api/auth/login
    ↓
Validate Email & Password
    ↓
Generate JWT Token
    ↓
Return { token, user }
    ↓
Store in localStorage
    ↓
Redirect based on role
    ↓
Protected Route
    ↓
JWT Token in Authorization Header
    ↓
Middleware Validates Token
    ↓
Extract User Info
    ↓
Proceed to Route Handler
```

---

## 🗄️ Database Relationships

### User → Employee (One-to-One)
```
User {
  id: 1
  email: "john.doe@example.com"
  role: "EMPLOYEE"
}
  ↓ (userId)
Employee {
  id: 1
  userId: 1
  firstName: "John"
  lastName: "Doe"
  department: "Engineering"
}
```

### Employee → Admin (Many-to-One)
```
User {
  id: 2
  email: "admin@example.com"
  role: "ADMIN"
}
  ↓ (adminId)
Employee {
  id: 1
  adminId: 2  # Employee is managed by this admin
}
```

### Employee ↔ Skill (Many-to-Many via EmployeeSkill)
```
Employee {
  id: 1
}
    ↔
EmployeeSkill {
  id: 1
  employeeId: 1
  skillId: 1
  level: "Beginner"
  status: "PENDING"
}
    ↔
Skill {
  id: 1
  name: "JavaScript"
  category: "Programming"
}
```

---

## 🔐 Security Features

### Password Security
- Passwords hashed using **bcrypt** with salt rounds
- Never stored in plain text
- Verified using bcrypt.compare()

### JWT Authentication
- Token generated on login
- Contains user ID and role
- Signed with secret key
- Verified on protected routes
- Stored in localStorage (client-side)
- Sent in Authorization header: `Bearer <token>`

### Role-Based Access Control
- Middleware checks user role
- Protected routes:
  - `/api/employees` - Admin only
  - `/api/skills/employee-skill-requests` - Admin only
  - `/api/skills/employee-skill-status` - Admin only
  - `/api/skills/my` - Authenticated users
  - `/api/skills/request` - Employees only

### Client-Side Route Protection
- `useEffect` hooks check localStorage for user and token
- Redirects to login if not authenticated
- Redirects based on role mismatch:
  - Employee trying to access `/admin` → `/dashboard`
  - Admin trying to access `/dashboard` → `/admin`

---

## 📊 API Request Examples

### 1. Login
```javascript
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "employee123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "john.doe@example.com",
    "role": "EMPLOYEE",
    "employee": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "department": "Engineering"
    }
  }
}
```

### 2. Request Skill
```javascript
POST http://localhost:4000/api/skills/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "skillId": 1,
  "level": "Beginner"
}

Response:
{
  "id": 1,
  "skillId": 1,
  "employeeId": 1,
  "level": "Beginner",
  "status": "PENDING",
  "skill": {
    "id": 1,
    "name": "JavaScript",
    "category": "Programming"
  }
}
```

### 3. Approve Skill Request
```javascript
PATCH http://localhost:4000/api/skills/employee-skill-status
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeSkillId": 1,
  "status": "APPROVED"
}

Response:
{
  "id": 1,
  "skillId": 1,
  "employeeId": 1,
  "level": "Beginner",
  "status": "APPROVED"
}
```

### 4. Get My Skills
```javascript
GET http://localhost:4000/api/skills/my
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "level": "Beginner",
    "status": "APPROVED",
    "skill": {
      "id": 1,
      "name": "JavaScript",
      "category": "Programming"
    }
  }
]
```

### 5. Get All Employees
```javascript
GET http://localhost:4000/api/employees
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "department": "Engineering",
    "user": {
      "email": "john.doe@example.com",
      "role": "EMPLOYEE"
    },
    "employeeSkills": [...]
  }
]
```

---

## 🎨 UI Components

### Color Coding
- **Blue** - Primary actions, admin branding
- **Green** - Success, approved status
- **Red** - Danger, rejected status, admin shield
- **Yellow** - Warning, pending status
- **Gray** - Neutral, backgrounds, text

### Status Badges
```javascript
const getStatusColor = (status) => {
  switch (status) {
    case 'APPROVED': return 'bg-green-100 text-green-800'
    case 'REJECTED': return 'bg-red-100 text-red-800'
    default: return 'bg-yellow-100 text-yellow-800' // PENDING
  }
}
```

---

## ✅ Complete User Journey Example

### Scenario: Employee Requests JavaScript Skill

**Step 1:** Employee logs in
```
john.doe@example.com logs in → Redirected to /dashboard
```

**Step 2:** Employee views available skills
```
Dashboard shows "Request New Skills" card with JavaScript skill
```

**Step 3:** Employee requests JavaScript skill
```
Clicks "Request" → API call → EmployeeSkill created with status: PENDING
Skill appears in "My Skills" with yellow "PENDING" badge
```

**Step 4:** Admin reviews request
```
admin@example.com logs in → Goes to /admin
Clicks "Skill Requests" tab
Sees: "John Doe - JavaScript (Level: Beginner) - PENDING"
```

**Step 5:** Admin approves request
```
Clicks green "Approve" button
API call updates status to "APPROVED"
Skill request card updates → Green badge, no action buttons
```

**Step 6:** Employee checks status
```
john.doe@example.com refreshes dashboard
JavaScript skill now shows green "APPROVED" badge
```

---

## 🐛 Common Issues & Solutions

### Issue: Can't login
**Solution:** Check if backend is running on port 4000

### Issue: No skills appearing
**Solution:** Run `node prisma/seed.js` to seed database

### Issue: "Failed to fetch"
**Solution:** Verify API_BASE URL matches backend port (4000)

### Issue: Token expired
**Solution:** Logout and login again to get new token

### Issue: Not redirecting after login
**Solution:** Check browser console for errors, verify role in response

---

## 📝 Testing Checklist

### Employee Flow
- [ ] Register new employee account
- [ ] Login with employee credentials
- [ ] View dashboard with no skills
- [ ] Request a new skill
- [ ] See skill in "My Skills" with PENDING status
- [ ] Logout successfully

### Admin Flow
- [ ] Login with admin credentials
- [ ] View employees tab
- [ ] See employee details
- [ ] Switch to skill requests tab
- [ ] See pending skill request
- [ ] Approve a skill request
- [ ] Verify status updated
- [ ] Reject a skill request
- [ ] Logout successfully

### Integration
- [ ] Employee requests skill → Admin sees it
- [ ] Admin approves → Employee sees updated status
- [ ] Admin rejects → Employee sees rejected status

---

**Application is now fully functional and ready for demonstration! 🎉**
