# Project Methodology

## Employee Skill Rating System with AI-Powered Project Assignment

---

## 1. INTRODUCTION

### 1.1 Project Overview
The Employee Skill Rating System is a comprehensive web-based application designed to streamline skill assessment, manager approval workflows, and AI-powered project assignment. The system enables employees to self-rate their skills, managers to review and approve these ratings, HR to leverage AI for optimal project-employee matching, and administrators to manage organizational hierarchies.

### 1.2 Objectives
- Develop a role-based skill management system with four distinct user roles (Employee, Manager, HR, Admin)
- Implement a structured skill approval workflow to ensure accurate skill assessments
- Integrate AI capabilities for intelligent project creation and candidate matching
- Create an intuitive user interface for seamless interaction across all user roles
- Establish a scalable and maintainable architecture for future enhancements

---

## 2. SYSTEM ARCHITECTURE

### 2.1 Architecture Pattern
The project follows a **Three-Tier Architecture** with clear separation of concerns:

#### **Presentation Layer (Frontend)**
- **Technology**: Next.js 15.5.3 with React 19
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS v4 for responsive design
- **Component Library**: Radix UI for accessible components
- **State Management**: React Hooks (useState, useEffect) and Context API for authentication

#### **Application Layer (Backend)**
- **Framework**: Node.js with Express.js
- **Language**: JavaScript (ES6+)
- **Authentication**: JWT (JSON Web Tokens) for stateless authentication
- **Middleware**: Custom authentication and role-based access control

#### **Data Layer**
- **Database**: SQLite for development and testing
- **ORM**: Prisma for type-safe database operations
- **Schema Design**: Relational model with foreign key constraints

### 2.2 Design Patterns Implemented

#### **MVC Pattern (Backend)**
- **Models**: Prisma schema definitions for database entities
- **Views**: JSON responses sent to frontend
- **Controllers**: Business logic handlers for each domain (auth, employees, skills, projects, ratings, admin)

#### **Component-Based Architecture (Frontend)**
- Reusable UI components (Navigation, ProtectedRoute, Cards, Dialogs)
- Page-level components for each user role and feature
- Shared utility functions in `/lib` directory

#### **Repository Pattern**
- Prisma client acts as repository layer
- Centralized database configuration in `config/prisma.js`
- Abstraction of data access logic in controllers

---

## 3. DEVELOPMENT METHODOLOGY

### 3.1 Development Approach
The project followed an **Agile-Iterative Development** approach with the following phases:

#### **Phase 1: Requirements Analysis & Planning**
1. Identified four distinct user roles and their permissions
2. Defined skill rating workflow (Employee → Manager → Approval)
3. Planned database schema with relationships
4. Created user flow diagrams for each role

#### **Phase 2: Database Design & Backend Development**
1. **Database Schema Design**
   - User table with role-based authentication
   - Employee table with 1-to-1 relationship to User
   - Skill table for centralized skill management
   - EmployeeSkill table for self-rating and manager approval
   - Project-related tables for AI-powered assignments

2. **Backend API Development**
   - RESTful API endpoints for all CRUD operations
   - JWT-based authentication middleware
   - Role-based authorization (isAdmin, isEmployee, isManager, isHR)
   - Input validation and error handling

3. **Key Backend Features Implemented**
   - User registration with role selection
   - Secure login with password hashing (bcrypt)
   - Employee profile management
   - Skill CRUD operations (HR only for create/update/delete)
   - Skill rating and approval workflow
   - Manager-employee assignment (Admin functionality)
   - AI integration with Google Gemini API

#### **Phase 3: Frontend Development**
1. **Authentication System**
   - Context API for global auth state
   - Protected routes with role-based access control
   - Automatic token management and refresh

2. **Role-Specific Dashboards**
   - **Employee Dashboard**: Self-rating, skill history, profile management
   - **Manager Dashboard**: Team overview, skill approvals, project assignments
   - **HR Dashboard**: Skill management, AI project creation, candidate matching
   - **Admin Dashboard**: User management, manager assignments, system overview

3. **UI/UX Implementation**
   - Responsive design for mobile and desktop
   - Consistent navigation across all roles
   - Interactive dialogs for CRUD operations
   - Real-time feedback with loading states and error messages

#### **Phase 4: AI Integration**
1. **Google Gemini API Integration**
   - Natural language processing for project requirements
   - Automatic skill extraction from project descriptions
   - Skill weight assignment based on project context

2. **Intelligent Candidate Matching Algorithm**
   ```
   Skill Index = Σ(project_weight × employee_rating) / count(project_skills)
   Match Percentage = (matched_skills / total_required_skills) × 100
   ```

3. **Features**
   - AI-powered project generation from natural language
   - Automatic candidate ranking based on skill match
   - Detailed skill breakdown for each candidate

#### **Phase 5: Testing & Refinement**
1. Manual testing of all user workflows
2. Role-based access control verification
3. Bug fixing and performance optimization
4. UI/UX improvements based on testing feedback

---

## 4. TECHNOLOGY STACK

### 4.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5.3 | React framework with server-side rendering |
| React | 19.1.0 | UI component library |
| TypeScript | Latest | Type-safe JavaScript |
| Tailwind CSS | v4 | Utility-first CSS framework |
| Radix UI | Latest | Accessible component primitives |
| Lucide React | Latest | Icon library |

### 4.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | Latest | JavaScript runtime |
| Express.js | Latest | Web application framework |
| Prisma | Latest | ORM for database operations |
| SQLite | Latest | Lightweight SQL database |
| bcryptjs | Latest | Password hashing |
| jsonwebtoken | Latest | JWT authentication |
| cors | Latest | Cross-origin resource sharing |

### 4.3 AI Integration

| Service | Purpose |
|---------|---------|
| Google Gemini API | Natural language processing for project analysis and skill extraction |

---

## 5. DATABASE DESIGN

### 5.1 Entity-Relationship Model

#### **Core Entities**
1. **User**: Authentication and role management
2. **Employee**: Employee profile and organizational hierarchy
3. **Skill**: Centralized skill repository
4. **EmployeeSkill**: Skill ratings and approval workflow
5. **Project**: Project information and requirements
6. **ProjectSkillRequirement**: AI-extracted skills with weights
7. **ProjectCandidateMatch**: AI-calculated candidate matches
8. **ProjectAssignment**: HR assignments with manager approval

### 5.2 Key Relationships

```
User (1) ←→ (0..1) Employee
Employee (1) ←→ (N) EmployeeSkill
Skill (1) ←→ (N) EmployeeSkill
Employee (1) ←→ (N) Employee [Manager-Subordinate]
Project (1) ←→ (N) ProjectSkillRequirement
Project (1) ←→ (N) ProjectCandidateMatch
Project (1) ←→ (N) ProjectAssignment
```

### 5.3 Database Schema Highlights

**User Table**
- Stores authentication credentials and role
- Roles: EMPLOYEE, MANAGER, HR, ADMIN
- Only EMPLOYEE and MANAGER roles have Employee profiles

**Employee Table**
- Contains personal and professional information
- `managerId`: References User.id of assigned manager
- Self-referential relationship for organizational hierarchy

**EmployeeSkill Table**
- `selfRating`: Employee's self-assessment (1-10)
- `managerRating`: Manager's adjusted rating (1-10)
- `managerStatus`: PENDING, APPROVED, REJECTED
- Unique constraint on (employeeId, skillId)

---

## 6. KEY FEATURES & WORKFLOWS

### 6.1 Skill Rating Workflow

```
1. HR creates a new skill in the system
2. Employee views available skills
3. Employee self-rates the skill (1-10 scale)
4. Rating status set to PENDING
5. Manager views pending approvals for their team
6. Manager reviews and can:
   - APPROVE with same rating
   - APPROVE with adjusted rating
   - REJECT with comments
7. Employee views approval history
```

### 6.2 Project Assignment Workflow

```
1. HR enters project description in natural language
2. AI (Gemini) extracts:
   - Project name
   - Detailed description
   - Required skills with importance weights
3. HR adjusts AI-generated skill weights if needed
4. Project is created in the system
5. HR navigates to candidate selection
6. System calculates for each employee:
   - Skill Index (weighted match score)
   - Match Percentage (coverage of required skills)
   - Missing skills list
7. HR reviews candidates and assigns best matches
8. Manager receives assignment for final approval
9. Manager approves or rejects assignment
```

### 6.3 Manager Assignment Workflow

```
1. Admin views all employees with EMPLOYEE role
2. Admin selects employee needing manager assignment
3. Admin chooses manager from dropdown (MANAGER role users)
4. System updates employee.managerId
5. Manager can now view and approve that employee's skill ratings
```

---

## 7. SECURITY IMPLEMENTATION

### 7.1 Authentication & Authorization

**JWT-Based Authentication**
- Tokens generated on successful login
- Tokens stored in localStorage on client
- Tokens sent in Authorization header for protected routes
- Token expiration and refresh mechanism

**Role-Based Access Control (RBAC)**
- Middleware functions: `isEmployee`, `isManager`, `isHR`, `isAdmin`
- Route-level protection for sensitive operations
- Frontend ProtectedRoute component for page-level access control

### 7.2 Data Security

**Password Security**
- Bcrypt hashing with salt rounds
- Passwords never stored in plain text
- Secure password validation

**SQL Injection Prevention**
- Prisma ORM with parameterized queries
- Input validation and sanitization
- Type safety with TypeScript

**Cross-Origin Resource Sharing (CORS)**
- Configured allowed origins
- Credential support enabled
- Specific HTTP methods allowed

---

## 8. AI INTEGRATION METHODOLOGY

### 8.1 Gemini API Integration

**Project Analysis**
```javascript
Input: Natural language project description
Process: Gemini API analyzes text and extracts:
  - Project objectives
  - Required technical skills
  - Skill importance weights (1-100)
Output: Structured JSON with skills and weights
```

**Candidate Matching Algorithm**
```javascript
For each employee:
  1. Fetch approved skill ratings
  2. Match against project requirements
  3. Calculate weighted skill index
  4. Calculate match percentage
  5. Identify missing skills
  6. Rank candidates by skill index
```

### 8.2 AI Prompt Engineering

**System Prompt Design**
- Structured output format specification
- Skill weight scale definition (1-100)
- Skill name normalization rules
- Handling of ambiguous requirements

---

## 9. API DESIGN

### 9.1 RESTful Endpoint Structure

**Authentication Endpoints**
- `POST /api/auth/register` - User registration with role
- `POST /api/auth/login` - User authentication

**Employee Endpoints**
- `GET /api/employees` - Get all employees (role-filtered)
- `GET /api/employees/me` - Get current user's profile
- `GET /api/employees/:id` - Get specific employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee (admin)

**Skill Endpoints**
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create skill (HR/Admin)
- `PUT /api/skills/:id` - Update skill (HR/Admin)
- `DELETE /api/skills/:id` - Delete skill (HR/Admin)

**Rating Endpoints**
- `POST /api/ratings/self-rate` - Employee self-rating
- `GET /api/ratings/my-ratings` - Get my ratings
- `GET /api/ratings/pending` - Get pending approvals (manager)
- `PUT /api/ratings/approve/:id` - Manager approval/rejection
- `GET /api/ratings/team` - Get team ratings (manager)

**Project Endpoints**
- `POST /api/projects/generate` - AI project generation
- `POST /api/projects` - Create project
- `GET /api/projects/all` - Get all projects (HR)
- `GET /api/projects/:id/candidates` - Get matched candidates
- `POST /api/projects/assign` - Assign employees to project
- `GET /api/projects/my-assignments` - Get my assignments (manager)
- `PUT /api/projects/assignments/:id/approve` - Manager approval

**Admin Endpoints**
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/role` - Change user role
- `PUT /api/admin/employees/:employeeId/assign-manager` - Assign manager
- `PUT /api/admin/employees/:employeeId/assign-hr` - Assign HR
- `GET /api/admin/stats` - Get system statistics

### 9.2 Response Format Standardization

**Success Response**
```json
{
  "id": 1,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response**
```json
{
  "error": "Error message",
  "details": "Additional context"
}
```

---

## 10. CHALLENGES & SOLUTIONS

### 10.1 Technical Challenges

**Challenge 1: Role-Based Data Access**
- **Problem**: Different roles need different data visibility
- **Solution**: Implemented role-checking middleware and conditional queries based on user role

**Challenge 2: Manager-Employee Hierarchy**
- **Problem**: Circular dependency in Employee self-referential relationship
- **Solution**: Used `managerId` referencing `User.id` instead of `Employee.id`

**Challenge 3: AI Response Consistency**
- **Problem**: Gemini API returns varying formats
- **Solution**: Structured prompts with explicit JSON schema and response validation

**Challenge 4: Frontend State Management**
- **Problem**: Auth state needed across all pages
- **Solution**: Implemented Context API with ProtectedRoute wrapper

**Challenge 5: Manager Assignment Visibility**
- **Problem**: Managers shown in assignment list
- **Solution**: Filtered employee list to show only EMPLOYEE role users

### 10.2 Design Decisions

**Decision 1: SQLite vs PostgreSQL**
- **Choice**: SQLite
- **Rationale**: Lightweight, zero-config, sufficient for project scope, easy deployment

**Decision 2: JWT vs Session-Based Auth**
- **Choice**: JWT
- **Rationale**: Stateless, scalable, works well with separate frontend/backend

**Decision 3: Skill Rating Scale (1-10)**
- **Choice**: 1-10 scale
- **Rationale**: More granular than 1-5, easier to understand than percentages

**Decision 4: AI Provider (Gemini vs OpenAI)**
- **Choice**: Google Gemini
- **Rationale**: Better structured output, cost-effective, good NLP capabilities

---

## 11. TESTING METHODOLOGY

### 11.1 Testing Approach

**Manual Testing**
- End-to-end workflow testing for each user role
- Role-based access control verification
- API endpoint testing with different payloads
- UI responsiveness across devices

**Test Scenarios**

1. **Authentication Flow**
   - Register with different roles
   - Login with valid/invalid credentials
   - Token expiration handling
   - Protected route access

2. **Skill Rating Workflow**
   - Employee self-rating
   - Manager approval/rejection
   - Rating history visibility
   - Permission boundaries

3. **Project Assignment**
   - AI project generation
   - Skill weight adjustment
   - Candidate matching accuracy
   - Assignment approval flow

4. **Admin Functions**
   - Manager assignment to employees
   - Manager dropdown population
   - Filter EMPLOYEE-only in assignments
   - User role changes

### 11.2 Bug Tracking & Resolution

**Key Issues Resolved**
1. Manager dropdown showing empty → Fixed API endpoint path
2. Managers appearing in assignment list → Added role filter
3. Role registration not working → Fixed backend role handling
4. Admin page using wrong auth → Updated to ProtectedRoute pattern

---

## 12. DEPLOYMENT CONSIDERATIONS

### 12.1 Production Readiness

**Backend Deployment**
- Environment variables for sensitive data (JWT secret, API keys)
- CORS configuration for production domains
- Database migration strategy
- Error logging and monitoring

**Frontend Deployment**
- Static site generation with Next.js
- Environment-based API URLs
- Asset optimization and code splitting
- SEO considerations

**Database Migration**
- Prisma migrate for schema updates
- Seed data for initial setup
- Backup and restore procedures

---

## 13. FUTURE ENHANCEMENTS

### 13.1 Planned Features

1. **Analytics Dashboard**
   - Skill distribution charts
   - Employee performance metrics
   - Project success rates

2. **Notification System**
   - Email notifications for pending approvals
   - Real-time updates using WebSockets
   - In-app notification center

3. **Advanced AI Features**
   - Skill gap analysis
   - Career path recommendations
   - Automated skill suggestions based on job roles

4. **Reporting Module**
   - Export skill reports to PDF/Excel
   - Custom report generation
   - Compliance and audit trails

5. **Enhanced Security**
   - Two-factor authentication
   - Password complexity requirements
   - Session management improvements
   - Audit logging for sensitive operations

---

## 14. CONCLUSION

The Employee Skill Rating System successfully demonstrates the integration of modern web technologies with AI capabilities to solve real-world HR challenges. The project showcases:

- **Scalable Architecture**: Clean separation of concerns with potential for microservices
- **Role-Based Security**: Comprehensive RBAC implementation
- **AI Integration**: Practical application of generative AI for business processes
- **User-Centric Design**: Intuitive interfaces for diverse user roles
- **Code Quality**: Type-safe, well-structured, and maintainable codebase

The methodology employed ensures that the system is not only functional but also maintainable, scalable, and ready for production deployment with minimal modifications.

---

## REFERENCES

1. Next.js Documentation - https://nextjs.org/docs
2. Prisma ORM Documentation - https://www.prisma.io/docs
3. Express.js Guide - https://expressjs.com/
4. Google Gemini API Documentation - https://ai.google.dev/docs
5. JWT Authentication Best Practices - https://jwt.io/introduction
6. Tailwind CSS Documentation - https://tailwindcss.com/docs
7. React 19 Documentation - https://react.dev/
