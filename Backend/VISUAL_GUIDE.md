# 🎯 Visual System Guide - Employee Skill Rating System

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ROLE HIERARCHY                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                        ADMIN (Super)                         │
│                           │                                  │
│              ┌────────────┼────────────┐                    │
│              │            │            │                     │
│             HR        MANAGER      EMPLOYEE                  │
│              │            │            │                     │
│         (Manages    (Approves)   (Self-rates)               │
│          Skills)     Ratings      Skills)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Workflow Diagram

```
┌──────────────┐
│ 1. REGISTER  │  Everyone starts as EMPLOYEE
│   (Default)  │  → john.employee@company.com
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 2. ADMIN     │  Admin assigns roles:
│  (Assigns    │  → sarah: EMPLOYEE → MANAGER
│   Roles)     │  → lisa: EMPLOYEE → HR
└──────┬───────┘  → john: manager = sarah, hr = lisa
       │
       ▼
┌──────────────┐
│ 3. HR        │  HR creates skills:
│  (Creates    │  → JavaScript (Programming)
│   Skills)    │  → Python (Programming)
└──────┬───────┘  → React (Frameworks)
       │
       ▼
┌──────────────┐
│ 4. EMPLOYEE  │  Employee self-rates:
│  (Self-Rate) │  → JavaScript: 4/5
└──────┬───────┘  → "3 years experience..."
       │           → Status: PENDING
       ▼
┌──────────────┐
│ 5. MANAGER   │  Manager reviews:
│  (Approve)   │  → Approve: 4/5 (keep same)
└──────┬───────┘  → OR Change: 3/5
       │           → OR Reject: needs revision
       ▼           → Status: APPROVED/REJECTED
┌──────────────┐
│ 6. EMPLOYEE  │  Employee views result:
│  (View       │  → Self: 4/5
│   Result)    │  → Manager: 3/5
└──────────────┘  → Manager comments: "Good work..."
```

---

## 👥 Role Capabilities Matrix

```
┌─────────────────────┬─────────┬─────────┬─────┬───────┐
│      ACTION         │EMPLOYEE │ MANAGER │ HR  │ ADMIN │
├─────────────────────┼─────────┼─────────┼─────┼───────┤
│ Register            │    ✅   │    ✅   │  ✅ │  ✅   │
│ Self-rate skills    │    ✅   │    ✅   │  ✅ │  ✅   │
│ View own ratings    │    ✅   │    ✅   │  ✅ │  ✅   │
│ View team data      │    ❌   │    ✅   │  ❌ │  ✅   │
│ Approve ratings     │    ❌   │    ✅   │  ❌ │  ✅   │
│ Reject ratings      │    ❌   │    ✅   │  ❌ │  ✅   │
│ Modify ratings      │    ❌   │    ✅   │  ❌ │  ✅   │
│ Create skills       │    ❌   │    ❌   │  ✅ │  ✅   │
│ Update skills       │    ❌   │    ❌   │  ✅ │  ✅   │
│ Delete skills       │    ❌   │    ❌   │  ✅ │  ✅   │
│ View all skills     │    ✅   │    ✅   │  ✅ │  ✅   │
│ Change user roles   │    ❌   │    ❌   │  ❌ │  ✅   │
│ Assign managers     │    ❌   │    ❌   │  ❌ │  ✅   │
│ Assign HR           │    ❌   │    ❌   │  ❌ │  ✅   │
│ View system stats   │    ❌   │    ❌   │  ❌ │  ✅   │
└─────────────────────┴─────────┴─────────┴─────┴───────┘
```

---

## 🎯 Rating Workflow Detail

```
EMPLOYEE PERSPECTIVE:
┌─────────────────────────────────────────────────────┐
│ 1. View Available Skills                            │
│    GET /api/skills (public, no auth)                │
│    ↓                                                 │
│ 2. Self-Rate JavaScript: 4/5                        │
│    POST /api/ratings/self-rate                      │
│    { skillId: 1, selfRating: 4, selfComments: "..." }│
│    ↓                                                 │
│ 3. View My Ratings                                  │
│    GET /api/ratings/my-ratings                      │
│    Status: PENDING (waiting for manager)            │
│    Can see: Self-rating only                        │
│    ↓                                                 │
│ 4. After Manager Approval                           │
│    GET /api/ratings/my-ratings                      │
│    Status: APPROVED                                 │
│    Can see: Self-rating + Manager rating + Comments │
└─────────────────────────────────────────────────────┘

MANAGER PERSPECTIVE:
┌─────────────────────────────────────────────────────┐
│ 1. View Pending Approvals                           │
│    GET /api/ratings/pending                         │
│    Shows: All pending ratings from direct reports   │
│    ↓                                                 │
│ 2. Review John's JavaScript Rating                  │
│    Self-rating: 4/5                                 │
│    Comments: "3 years experience..."                │
│    ↓                                                 │
│ 3. Decision Options:                                │
│    A) Approve as-is (keep 4/5)                      │
│    B) Approve with change (change to 3/5)           │
│    C) Reject (send back for revision)               │
│    ↓                                                 │
│ 4. Submit Decision                                  │
│    PUT /api/ratings/approve/:id                     │
│    { managerStatus: "APPROVED",                     │
│      managerRating: 3,                              │
│      managerComments: "Good progress..." }          │
│    ↓                                                 │
│ 5. Employee Notified                                │
│    Status changed: PENDING → APPROVED               │
│    Employee can now see manager feedback            │
└─────────────────────────────────────────────────────┘
```

---

## 🗂️ Database Relationships

```
┌─────────────┐
│    USER     │
├─────────────┤
│ id (PK)     │───┐
│ email       │   │
│ password    │   │
│ role        │   │
└─────────────┘   │
                  │ 1:1
                  │
                  ▼
            ┌─────────────┐
            │  EMPLOYEE   │
            ├─────────────┤
            │ id (PK)     │───┐
            │ firstName   │   │
            │ userId (FK) │◄──┘
            │ managerId   │───┐ (self-reference via userId)
            │ hrId        │   │
            └─────────────┘   │
                  │ 1:M       │
                  │           │
                  ▼           │
            ┌─────────────┐   │
            │EMPLOYEE     │◄──┘
            │SKILL        │
            ├─────────────┤
            │ id (PK)     │
            │ employeeId  │───┐
            │ skillId     │   │
            │ selfRating  │   │
            │ managerRating│  │
            │ status      │   │
            └─────────────┘   │
                              │ M:1
                              ▼
                        ┌─────────────┐
                        │   SKILL     │
                        ├─────────────┤
                        │ id (PK)     │
                        │ name        │
                        │ category    │
                        │ description │
                        └─────────────┘
```

---

## 🎬 5-Minute Demo Flow Chart

```
MINUTE 1: SETUP
├── Register john.employee@company.com    → Token saved
├── Register sarah.manager@company.com    → Token saved
├── Register lisa.hr@company.com          → Token saved
└── Register admin@company.com            → Token saved
    All start with role: EMPLOYEE ✅

MINUTE 2: ADMIN SETUP
├── Login as admin@company.com
├── PUT /admin/users/2/role { "role": "MANAGER" }     → Sarah is MANAGER
├── PUT /admin/users/3/role { "role": "HR" }          → Lisa is HR
├── PUT /admin/employees/1/assign-manager { id: 2 }   → John's manager = Sarah
└── PUT /admin/employees/1/assign-hr { id: 3 }        → John's HR = Lisa
    Hierarchy established ✅

MINUTE 3: HR CREATES SKILLS
├── Login as lisa.hr@company.com
├── POST /skills { "name": "JavaScript", "category": "Programming" }
├── POST /skills { "name": "Python", "category": "Programming" }
└── POST /skills { "name": "React", "category": "Frameworks" }
    3 skills created ✅

MINUTE 4: EMPLOYEE RATES
├── Login as john.employee@company.com
├── GET /skills                           → View available skills
├── POST /ratings/self-rate {
│       skillId: 1,
│       selfRating: 4,
│       selfComments: "3 years experience"
│   }                                     → Rating created
└── GET /ratings/my-ratings               → Status: PENDING
    Employee rated JavaScript 4/5 ✅

MINUTE 5: MANAGER APPROVES
├── Login as sarah.manager@company.com
├── GET /ratings/pending                  → See John's pending rating
├── PUT /ratings/approve/1 {
│       managerStatus: "APPROVED",
│       managerRating: 3,
│       managerComments: "Good progress, let's work on advanced topics"
│   }                                     → Rating approved with change
└── John can now see: Status: APPROVED, Manager: 3/5, Comments ✅
    Complete workflow finished! 🎉
```

---

## 🔒 Access Control Visualization

```
┌───────────────────────────────────────────────────────┐
│                   PUBLIC ENDPOINTS                     │
│   Anyone can access (no authentication required)      │
├───────────────────────────────────────────────────────┤
│   GET /api/skills              → View all skills      │
│   GET /api/skills/:id          → View skill details   │
│   POST /api/auth/register      → Register new user    │
│   POST /api/auth/login         → Login                │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│               EMPLOYEE ENDPOINTS (All Roles)          │
│   Requires: Bearer Token                              │
├───────────────────────────────────────────────────────┤
│   GET /api/employees/me        → My profile           │
│   POST /api/ratings/self-rate  → Self-rate skill      │
│   GET /api/ratings/my-ratings  → View my ratings      │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│               MANAGER ENDPOINTS ONLY                   │
│   Requires: Bearer Token + MANAGER/HR/ADMIN role      │
├───────────────────────────────────────────────────────┤
│   GET /api/employees           → View team            │
│   GET /api/ratings/pending     → Pending approvals    │
│   PUT /api/ratings/approve/:id → Approve/reject       │
│   GET /api/ratings/team        → Team ratings         │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                  HR ENDPOINTS ONLY                     │
│   Requires: Bearer Token + HR/ADMIN role              │
├───────────────────────────────────────────────────────┤
│   POST /api/skills             → Create skill         │
│   PUT /api/skills/:id          → Update skill         │
│   DELETE /api/skills/:id       → Delete skill         │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                 ADMIN ENDPOINTS ONLY                   │
│   Requires: Bearer Token + ADMIN role                 │
├───────────────────────────────────────────────────────┤
│   GET /api/admin/users                  → All users   │
│   PUT /api/admin/users/:id/role         → Change role │
│   PUT /api/admin/employees/:id/assign-* → Assignments │
│   GET /api/admin/stats                  → Statistics  │
│   PUT /api/employees/:id                → Update any  │
│   DELETE /api/employees/:id             → Delete any  │
└───────────────────────────────────────────────────────┘
```

---

## 📊 Rating Scale Visual

```
SKILL RATING SCALE (1-5):

⭐ 1 = BEGINNER
├── Basic understanding
├── Requires significant guidance
└── Limited practical experience

⭐⭐ 2 = DEVELOPING
├── Working knowledge
├── Requires some guidance
└── Growing practical experience

⭐⭐⭐ 3 = COMPETENT
├── Good working knowledge
├── Can work independently
└── Solid practical experience

⭐⭐⭐⭐ 4 = PROFICIENT
├── Advanced knowledge
├── Works efficiently and independently
└── Extensive practical experience

⭐⭐⭐⭐⭐ 5 = EXPERT
├── Master-level expertise
├── Can mentor others
└── Deep theoretical and practical knowledge
```

---

## 🧪 Testing Flow

```
START: Import Postman Collection
  │
  ├─> Section 1: SETUP
  │   ├─> 1.1 Register Employee       [201] ✅
  │   ├─> 1.2 Register Manager        [201] ✅
  │   ├─> 1.3 Register HR             [201] ✅
  │   └─> 1.4 Register Admin          [201] ✅
  │
  ├─> Section 2: ADMIN
  │   ├─> 2.1 Change to MANAGER       [200] ✅
  │   ├─> 2.2 Change to HR            [200] ✅
  │   ├─> 2.3 Assign Manager          [200] ✅
  │   ├─> 2.4 Assign HR               [200] ✅
  │   ├─> 2.5 Get Stats               [200] ✅
  │   └─> 2.6 Get All Users           [200] ✅
  │
  ├─> Section 3: HR
  │   ├─> 3.1 Create JavaScript       [201] ✅
  │   ├─> 3.2 Create Python           [201] ✅
  │   ├─> 3.3 Create React            [201] ✅
  │   ├─> 3.4 Update Skill            [200] ✅
  │   ├─> 3.5 Get All Skills          [200] ✅
  │   └─> 3.6 Get Employees           [200] ✅
  │
  ├─> Section 4: EMPLOYEE
  │   ├─> 4.1 Get My Profile          [200] ✅
  │   ├─> 4.2 View Skills (Public)    [200] ✅
  │   ├─> 4.3 Self-Rate JavaScript    [201] ✅
  │   └─> 4.4 View My Ratings         [200] ✅ (PENDING)
  │
  ├─> Section 5: MANAGER
  │   ├─> 5.1 Get Pending Approvals   [200] ✅
  │   ├─> 5.2 Approve (Keep Same)     [200] ✅
  │   ├─> 5.3 Approve (Change)        [200] ✅
  │   ├─> 5.4 Reject                  [200] ✅
  │   ├─> 5.5 View Team Ratings       [200] ✅
  │   └─> 5.6 Get Direct Reports      [200] ✅
  │
  └─> Section 6: NEGATIVE TESTS
      ├─> 6.1 Employee Create Skill   [403] ✅ EXPECTED FAIL
      ├─> 6.2 Manager Delete Skill    [403] ✅ EXPECTED FAIL
      ├─> 6.3 Employee Change Role    [403] ✅ EXPECTED FAIL
      └─> 6.4 Manager View Stats      [403] ✅ EXPECTED FAIL
  │
END: All Tests Pass! 🎉
```

---

## 🎯 Success Indicators

```
✅ DATABASE
   ├── Schema valid (no errors)
   ├── Tables created (User, Employee, Skill, EmployeeSkill)
   └── Relationships established

✅ SERVER
   ├── Running on port 4000
   ├── No startup errors
   └── Health check responds

✅ AUTHENTICATION
   ├── Registration works (default EMPLOYEE)
   ├── Login returns JWT token
   └── Token validation works

✅ ROLE ASSIGNMENT
   ├── Admin can change roles
   ├── Roles persist in database
   └── Middleware checks roles

✅ SKILL MANAGEMENT
   ├── HR can create skills
   ├── HR can update skills
   ├── HR can delete skills
   └── Skills are public (viewable)

✅ RATING WORKFLOW
   ├── Employee can self-rate (1-5)
   ├── Manager sees pending approvals
   ├── Manager can approve/reject/modify
   └── Employee sees approved ratings

✅ ACCESS CONTROL
   ├── Employee cannot create skills [403]
   ├── Manager cannot delete skills [403]
   ├── Employee cannot change roles [403]
   └── Manager cannot view admin stats [403]
```

---

**System Status:** ✅ FULLY OPERATIONAL
**Documentation:** ✅ COMPLETE
**Testing:** ✅ READY

**🚀 YOU'RE READY TO TEST!**
