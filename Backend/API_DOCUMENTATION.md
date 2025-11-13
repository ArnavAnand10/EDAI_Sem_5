# API Documentation - Role-Based Access Control System

## Overview
This system implements a comprehensive role-based access control (RBAC) with skill rating and approval workflow.

## Roles

### 1. EMPLOYEE
- Cannot change demographic information
- Can self-rate their skills
- Can view their own skill ratings after manager approval
- Cannot see ratings until manager/manager's manager approves

### 2. MANAGER
- Cannot change demographic information
- Can rate, approve, reject, or modify skill ratings for direct reports
- Can view skill ratings of their team
- Can search skills across the organization using keywords
- Ratings submitted to their manager (if applicable)

### 3. MANAGER_MANAGER
- Cannot change demographic information
- Can rate, approve, reject, or modify skill ratings after manager approval
- Can view skill ratings of their extended team
- Can search skills across the organization
- Provides final approval for skill ratings

### 4. HR_ADMIN (HR Administrator)
- **Full demographic control**: Can change all employee demographic information
- Can add, delete, and modify skills
- Can change skill weightage
- Can add new skills to the system
- Can search complete skill data
- Can pull all reports (skill distribution, employee summary, department analysis)
- Can manage reporting relationships

### 5. SYSTEM_ADMIN (System Administrator)
- Can add new companies
- Can create system backups
- Can perform security audits
- Access to audit logs
- All high-tech system activities
- Full system management capabilities

---

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "EMPLOYEE|MANAGER|MANAGER_MANAGER|HR_ADMIN|SYSTEM_ADMIN",
  "adminId": 1  // Required for employees
}
```

#### POST `/api/auth/login`
Login user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### Employee Routes (`/api/employees`)

#### GET `/api/employees/me`
Get current user's employee profile
- **Auth Required**: Yes
- **Roles**: All authenticated users

#### GET `/api/employees/my-team`
Get team members (for managers)
- **Auth Required**: Yes
- **Roles**: MANAGER, MANAGER_MANAGER, HR_ADMIN, SYSTEM_ADMIN

#### GET `/api/employees`
Get all employees
- **Auth Required**: Yes
- **Roles**: MANAGER+
- **HR/System Admin**: See all employees
- **Managers**: See direct reports only

#### GET `/api/employees/:id`
Get specific employee
- **Auth Required**: Yes
- **Access**: Own profile, or managed employee, or HR/System Admin

#### POST `/api/employees`
Create new employee (with demographic info)
- **Auth Required**: Yes
- **Roles**: HR_ADMIN, SYSTEM_ADMIN only
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "department": "Engineering",
  "position": "Software Engineer",
  "contactInfo": "jane@example.com",
  "dateOfJoining": "2024-01-15",
  "location": "New York",
  "managerId": 5,
  "managerManagerId": 3,
  "companyId": 1,
  "email": "jane@example.com",
  "password": "securepass",
  "role": "EMPLOYEE"
}
```

#### PUT `/api/employees/:id`
Update employee
- **Auth Required**: Yes
- **Demographic fields**: Only HR_ADMIN can modify
- **Other fields**: Employee can update own, Manager can update team
- **Protected Demographic Fields**:
  - firstName, lastName, department, contactInfo
  - position, dateOfJoining, location, companyId

#### DELETE `/api/employees/:id`
Delete employee
- **Auth Required**: Yes
- **Roles**: HR_ADMIN, SYSTEM_ADMIN only

---

### Skill Routes (`/api/skills`)

#### GET `/api/skills`
Get all skills (public)
- **Query Params**:
  - `category`: Filter by category
  - `minWeightage`: Minimum weightage filter

#### POST `/api/skills`
Create new skill
- **Auth Required**: Yes
- **Roles**: HR_ADMIN, SYSTEM_ADMIN
```json
{
  "name": "Python",
  "category": "Programming",
  "weightage": 8
}
```

#### PUT `/api/skills/:id`
Update skill (including weightage)
- **Auth Required**: Yes
- **Roles**: HR_ADMIN, SYSTEM_ADMIN
```json
{
  "name": "Python Programming",
  "category": "Programming Languages",
  "weightage": 9
}
```

#### DELETE `/api/skills/:id`
Delete skill
- **Auth Required**: Yes
- **Roles**: HR_ADMIN, SYSTEM_ADMIN

---

### Rating Routes (`/api/ratings`)

#### POST `/api/ratings/self-rate`
Employee self-rates a skill
- **Auth Required**: Yes
- **Roles**: All employees
```json
{
  "skillId": 5,
  "selfRating": 4,
  "selfComments": "I have 2 years of experience with Python"
}
```

#### GET `/api/ratings/my-ratings`
View own skill ratings
- **Auth Required**: Yes
- **Visibility**: 
  - Always see self-rating
  - See manager rating after manager approval
  - See manager's manager rating after their approval
  - See final rating when fully approved

#### PUT `/api/ratings/manager/:employeeSkillId`
Manager rates/approves/rejects skill
- **Auth Required**: Yes
- **Roles**: MANAGER, MANAGER_MANAGER, HR_ADMIN, SYSTEM_ADMIN
```json
{
  "managerRating": 3,
  "managerComments": "Good understanding, needs more practical experience",
  "managerStatus": "APPROVED|REJECTED|MODIFIED"
}
```

#### PUT `/api/ratings/manager-manager/:employeeSkillId`
Manager's manager final approval
- **Auth Required**: Yes
- **Roles**: MANAGER_MANAGER, HR_ADMIN, SYSTEM_ADMIN
```json
{
  "managerManagerRating": 4,
  "managerManagerComments": "Approved with higher rating",
  "managerManagerStatus": "APPROVED|REJECTED|MODIFIED"
}
```

#### GET `/api/ratings/team-ratings`
View team skill ratings
- **Auth Required**: Yes
- **Roles**: MANAGER, MANAGER_MANAGER, HR_ADMIN, SYSTEM_ADMIN

#### GET `/api/ratings/pending-approvals`
Get pending skill approvals
- **Auth Required**: Yes
- **Roles**: MANAGER+
- **Returns**: Skills pending current user's approval

---

### Search Routes (`/api/search`)

#### GET `/api/search/skills`
Search skills across organization (for managers)
- **Auth Required**: Yes
- **Roles**: MANAGER, MANAGER_MANAGER, HR_ADMIN, SYSTEM_ADMIN
- **Query Params**:
  - `keyword`: Search term (required)
  - `minRating`: Minimum rating filter
  - `category`: Filter by skill category
  - `department`: Filter by employee department

#### GET `/api/search/all-skill-data`
Get complete skill data (HR only)
- **Auth Required**: Yes
- **Roles**: HR_ADMIN, SYSTEM_ADMIN
- **Query Params**:
  - `status`: Filter by status
  - `employeeId`: Filter by employee
  - `skillId`: Filter by skill
  - `department`: Filter by department
  - `minRating`: Minimum rating

#### GET `/api/search/reports/skill-distribution`
Skill distribution report
- **Auth Required**: Yes
- **Roles**: HR_ADMIN, SYSTEM_ADMIN
- **Returns**: Skills with employee count, avg rating, department distribution

#### GET `/api/search/reports/employee-summary`
Employee skill summary report
- **Auth Required**: Yes
- **Roles**: HR_ADMIN, SYSTEM_ADMIN
- **Query Params**:
  - `department`: Filter by department
  - `minSkillCount`: Minimum skills required
- **Returns**: Employee-wise skill counts and ratings

#### GET `/api/search/reports/department-analysis`
Department-wise skill analysis
- **Auth Required**: Yes
- **Roles**: HR_ADMIN, SYSTEM_ADMIN
- **Returns**: Department stats with top skills

#### POST `/api/search/reports/skill-gap`
Skill gap analysis
- **Auth Required**: Yes
- **Roles**: HR_ADMIN, SYSTEM_ADMIN
```json
{
  "targetSkills": [1, 5, 8, 12]  // Array of skill IDs
}
```
- **Returns**: Employees with missing critical skills

---

### System Admin Routes (`/api/system`)

#### GET `/api/system/audit-logs`
Get audit logs
- **Auth Required**: Yes
- **Roles**: SYSTEM_ADMIN
- **Query Params**:
  - `userId`: Filter by user
  - `action`: Filter by action type
  - `entity`: Filter by entity type
  - `startDate`: Start date
  - `endDate`: End date
  - `limit`: Max results (default: 100)

#### GET `/api/system/security-audit`
Get security audit report
- **Auth Required**: Yes
- **Roles**: SYSTEM_ADMIN
- **Returns**:
  - Failed logins (last 24h)
  - Unauthorized access attempts
  - Suspicious IPs
  - Recent admin modifications

#### POST `/api/system/backup`
Create system backup
- **Auth Required**: Yes
- **Roles**: SYSTEM_ADMIN
- **Creates**: JSON backup of all data (last 90 days of audit logs)

#### GET `/api/system/backups`
Get backup history
- **Auth Required**: Yes
- **Roles**: SYSTEM_ADMIN
- **Query Params**:
  - `status`: Filter by status
  - `limit`: Max results (default: 50)

#### GET `/api/system/stats`
Get system statistics
- **Auth Required**: Yes
- **Roles**: SYSTEM_ADMIN
- **Returns**: User counts, employee stats, skill stats, activity metrics

#### POST `/api/system/cleanup/audit-logs`
Cleanup old audit logs
- **Auth Required**: Yes
- **Roles**: SYSTEM_ADMIN
```json
{
  "days": 90  // Delete logs older than this (default: 90)
}
```

---

## Workflow Examples

### Employee Self-Rating Workflow
1. Employee creates self-rating: `POST /api/ratings/self-rate`
2. Manager views pending approvals: `GET /api/ratings/pending-approvals`
3. Manager approves/modifies: `PUT /api/ratings/manager/:id`
4. If Manager's Manager exists:
   - Manager's Manager views pending: `GET /api/ratings/pending-approvals`
   - Manager's Manager approves: `PUT /api/ratings/manager-manager/:id`
5. Employee views approved rating: `GET /api/ratings/my-ratings`

### HR Admin Managing Skills
1. Add new skill: `POST /api/skills`
2. Set weightage: `PUT /api/skills/:id` (weightage: 1-10)
3. View skill distribution: `GET /api/search/reports/skill-distribution`
4. Identify skill gaps: `POST /api/search/reports/skill-gap`

### Manager Searching Skills
1. Search by keyword: `GET /api/search/skills?keyword=python&minRating=4`
2. View team ratings: `GET /api/ratings/team-ratings`
3. Approve pending ratings: `GET /api/ratings/pending-approvals`

### System Admin Activities
1. View security audit: `GET /api/system/security-audit`
2. Create backup: `POST /api/system/backup`
3. View audit logs: `GET /api/system/audit-logs`
4. Check system stats: `GET /api/system/stats`

---

## Database Schema Changes

### New Fields in Employee Table
- `position`: Job title/position
- `dateOfJoining`: Date of joining
- `location`: Employee location
- `managerManagerId`: Reference to manager's manager

### Updated EmployeeSkill Table (Rating System)
- `selfRating`: Employee's self-rating (1-5)
- `selfComments`: Employee's comments
- `managerRating`: Manager's rating (1-5)
- `managerComments`: Manager's feedback
- `managerStatus`: PENDING|APPROVED|REJECTED|MODIFIED
- `managerApprovedAt`: Timestamp
- `managerManagerRating`: Manager's manager rating (1-5)
- `managerManagerComments`: Manager's manager feedback
- `managerManagerStatus`: PENDING|APPROVED|REJECTED|MODIFIED
- `managerManagerApprovedAt`: Timestamp
- `finalRating`: Final approved rating
- `status`: PENDING|IN_REVIEW|APPROVED|REJECTED

### New Tables
- **AuditLog**: Track all system activities
- **SystemBackup**: Track backup operations

### Updated Skill Table
- `weightage`: Skill importance (1-10)

---

## Migration Instructions

**⚠️ WARNING**: This migration will drop the `manager` column and `level` column from existing tables.

To apply the migration:

1. **Backup existing data** (if needed)
2. Run migration:
   ```bash
   cd Backend
   npx prisma migrate dev --name add_role_based_access_and_rating_system
   ```

If you have existing data, you may need to manually migrate the data before applying the schema changes.

---

## Security Notes

1. **Demographic Protection**: Only HR_ADMIN can modify demographic fields
2. **Audit Logging**: All critical operations should be logged (implement in controllers)
3. **Password Security**: Passwords are hashed using argon2
4. **JWT Authentication**: All protected routes require valid JWT token
5. **Role Verification**: Middleware checks roles before granting access

---

## Testing the API

### Test Employee Self-Rating
```bash
# Login as employee
POST /api/auth/login
{
  "email": "employee@example.com",
  "password": "password"
}

# Self-rate a skill
POST /api/ratings/self-rate
Authorization: Bearer <token>
{
  "skillId": 1,
  "selfRating": 4,
  "selfComments": "Proficient in JavaScript"
}
```

### Test Manager Approval
```bash
# Login as manager
POST /api/auth/login
{
  "email": "manager@example.com",
  "password": "password"
}

# View pending approvals
GET /api/ratings/pending-approvals
Authorization: Bearer <token>

# Approve rating
PUT /api/ratings/manager/1
Authorization: Bearer <token>
{
  "managerRating": 4,
  "managerComments": "Good skills",
  "managerStatus": "APPROVED"
}
```

### Test HR Admin Functions
```bash
# Login as HR admin
POST /api/auth/login
{
  "email": "hr@example.com",
  "password": "password"
}

# Add new skill
POST /api/skills
Authorization: Bearer <token>
{
  "name": "React",
  "category": "Frontend",
  "weightage": 8
}

# View reports
GET /api/search/reports/skill-distribution
Authorization: Bearer <token>
```

---

## Support

For issues or questions, refer to the main README.md or contact the development team.
