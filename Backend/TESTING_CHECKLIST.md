# ✅ Testing Checklist - Employee Skill Rating System

## 🎯 Pre-Testing Setup

- [x] ✅ Database created successfully
- [x] ✅ Server running on port 4000
- [x] ✅ Prisma client generated
- [ ] ⏳ Postman collection imported
- [ ] ⏳ Ready to test

---

## 📝 SECTION 1: USER REGISTRATION (4 requests)

### Test 1.1: Register Employee ✅
```
POST http://localhost:4000/api/auth/register
Body: {
  "email": "john.employee@company.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "department": "Engineering",
  "position": "Software Engineer"
}
```
- [ ] Status: 201 Created
- [ ] Response contains token
- [ ] Response contains user with role="EMPLOYEE"
- [ ] Token saved to {{employeeToken}}

### Test 1.2: Register Manager ✅
```
POST http://localhost:4000/api/auth/register
Body: {
  "email": "sarah.manager@company.com",
  "password": "password123",
  "firstName": "Sarah",
  "lastName": "Manager",
  "department": "Engineering",
  "position": "Engineering Manager"
}
```
- [ ] Status: 201 Created
- [ ] Role="EMPLOYEE" (will be changed by admin)
- [ ] Token saved to {{managerToken}}

### Test 1.3: Register HR ✅
```
POST http://localhost:4000/api/auth/register
Body: {
  "email": "lisa.hr@company.com",
  "password": "password123",
  "firstName": "Lisa",
  "lastName": "HR",
  "department": "Human Resources",
  "position": "HR Manager"
}
```
- [ ] Status: 201 Created
- [ ] Role="EMPLOYEE" (will be changed by admin)
- [ ] Token saved to {{hrToken}}

### Test 1.4: Register Admin ✅
```
POST http://localhost:4000/api/auth/register
Body: {
  "email": "admin@company.com",
  "password": "admin123",
  "firstName": "System",
  "lastName": "Admin",
  "department": "IT",
  "position": "System Administrator"
}
```
- [ ] Status: 201 Created
- [ ] Role="EMPLOYEE" (will be changed manually)
- [ ] Token saved to {{adminToken}}

**Note:** Manually change admin role in database or create first admin differently

---

## 📝 SECTION 2: ADMIN ROLE ASSIGNMENT (6 requests)

### Test 2.1: Change Sarah to MANAGER ✅
```
PUT http://localhost:4000/api/admin/users/{{managerId}}/role
Headers: Authorization: Bearer {{adminToken}}
Body: { "role": "MANAGER" }
```
- [ ] Status: 200 OK
- [ ] Response shows role="MANAGER"
- [ ] Sarah can now approve ratings

### Test 2.2: Change Lisa to HR ✅
```
PUT http://localhost:4000/api/admin/users/{{hrId}}/role
Headers: Authorization: Bearer {{adminToken}}
Body: { "role": "HR" }
```
- [ ] Status: 200 OK
- [ ] Response shows role="HR"
- [ ] Lisa can now manage skills

### Test 2.3: Assign Sarah as Manager to John ✅
```
PUT http://localhost:4000/api/admin/employees/{{employeeId}}/assign-manager
Headers: Authorization: Bearer {{adminToken}}
Body: { "managerId": {{managerId}} }
```
- [ ] Status: 200 OK
- [ ] John's managerId set to Sarah's userId
- [ ] Reporting relationship established

### Test 2.4: Assign Lisa as HR to John ✅
```
PUT http://localhost:4000/api/admin/employees/{{employeeId}}/assign-hr
Headers: Authorization: Bearer {{adminToken}}
Body: { "hrId": {{hrId}} }
```
- [ ] Status: 200 OK
- [ ] John's hrId set to Lisa's userId
- [ ] HR relationship established

### Test 2.5: Get System Stats ✅
```
GET http://localhost:4000/api/admin/stats
Headers: Authorization: Bearer {{adminToken}}
```
- [ ] Status: 200 OK
- [ ] Shows user counts by role
- [ ] Shows employee counts
- [ ] Shows skill and rating statistics

### Test 2.6: Get All Users ✅
```
GET http://localhost:4000/api/admin/users
Headers: Authorization: Bearer {{adminToken}}
```
- [ ] Status: 200 OK
- [ ] Shows all 4 users
- [ ] Each user has correct role assigned
- [ ] Employee data included

---

## 📝 SECTION 3: HR SKILL MANAGEMENT (6 requests)

### Test 3.1: Create JavaScript Skill ✅
```
POST http://localhost:4000/api/skills
Headers: Authorization: Bearer {{hrToken}}
Body: {
  "name": "JavaScript",
  "category": "Programming Languages",
  "description": "JavaScript programming language proficiency"
}
```
- [ ] Status: 201 Created
- [ ] Skill ID saved to {{skillId}}
- [ ] Skill visible in database

### Test 3.2: Create Python Skill ✅
```
POST http://localhost:4000/api/skills
Headers: Authorization: Bearer {{hrToken}}
Body: {
  "name": "Python",
  "category": "Programming Languages",
  "description": "Python programming language proficiency"
}
```
- [ ] Status: 201 Created
- [ ] Skill created successfully

### Test 3.3: Create React Skill ✅
```
POST http://localhost:4000/api/skills
Headers: Authorization: Bearer {{hrToken}}
Body: {
  "name": "React",
  "category": "Frameworks",
  "description": "React.js framework expertise"
}
```
- [ ] Status: 201 Created
- [ ] Skill created successfully

### Test 3.4: Update JavaScript Skill ✅
```
PUT http://localhost:4000/api/skills/{{skillId}}
Headers: Authorization: Bearer {{hrToken}}
Body: {
  "name": "JavaScript (ES6+)",
  "description": "Modern JavaScript with ES6+ features"
}
```
- [ ] Status: 200 OK
- [ ] Skill name updated
- [ ] Description updated

### Test 3.5: Get All Skills ✅
```
GET http://localhost:4000/api/skills
Headers: Authorization: Bearer {{hrToken}}
```
- [ ] Status: 200 OK
- [ ] Shows 3 skills created
- [ ] Skills have categories and descriptions

### Test 3.6: Get All Employees (HR View) ✅
```
GET http://localhost:4000/api/employees
Headers: Authorization: Bearer {{hrToken}}
```
- [ ] Status: 200 OK
- [ ] HR sees employees under them
- [ ] Shows John (assigned to Lisa as HR)

---

## 📝 SECTION 4: EMPLOYEE SELF-RATING (4 requests)

### Test 4.1: Get My Profile ✅
```
GET http://localhost:4000/api/employees/me
Headers: Authorization: Bearer {{employeeToken}}
```
- [ ] Status: 200 OK
- [ ] Shows John's profile
- [ ] Includes manager (Sarah)
- [ ] Includes HR (Lisa)

### Test 4.2: View Available Skills (Public) ✅
```
GET http://localhost:4000/api/skills
No authorization header needed
```
- [ ] Status: 200 OK
- [ ] Shows all 3 skills (public access)
- [ ] No authentication required
- [ ] Skills have descriptions

### Test 4.3: Self-Rate JavaScript Skill ✅
```
POST http://localhost:4000/api/ratings/self-rate
Headers: Authorization: Bearer {{employeeToken}}
Body: {
  "skillId": {{skillId}},
  "selfRating": 4,
  "selfComments": "I have 3 years of experience with JavaScript. Comfortable with ES6+ features, async programming, and modern frameworks."
}
```
- [ ] Status: 201 Created
- [ ] Rating ID saved to {{ratingId}}
- [ ] selfRating = 4
- [ ] managerStatus = "PENDING"
- [ ] Rating saved in database

### Test 4.4: View My Ratings ✅
```
GET http://localhost:4000/api/ratings/my-ratings
Headers: Authorization: Bearer {{employeeToken}}
```
- [ ] Status: 200 OK
- [ ] Shows 1 rating (JavaScript)
- [ ] selfRating: 4
- [ ] managerRating: null (not approved yet)
- [ ] managerStatus: PENDING

---

## 📝 SECTION 5: MANAGER APPROVAL (6 requests)

### Test 5.1: Get Pending Approvals ✅
```
GET http://localhost:4000/api/ratings/pending
Headers: Authorization: Bearer {{managerToken}}
```
- [ ] Status: 200 OK
- [ ] Shows John's JavaScript rating
- [ ] selfRating: 4
- [ ] selfComments visible
- [ ] managerStatus: PENDING

### Test 5.2: Approve Rating (Keep Same) ✅
```
PUT http://localhost:4000/api/ratings/approve/{{ratingId}}
Headers: Authorization: Bearer {{managerToken}}
Body: {
  "managerStatus": "APPROVED",
  "managerComments": "I agree with this assessment. John has demonstrated strong JavaScript skills."
}
```
- [ ] Status: 200 OK
- [ ] managerStatus: APPROVED
- [ ] managerRating: 4 (same as self-rating)
- [ ] managerComments saved
- [ ] managerApprovedAt set

### Test 5.3: Approve with Changed Rating ✅
```
PUT http://localhost:4000/api/ratings/approve/{{ratingId}}
Headers: Authorization: Bearer {{managerToken}}
Body: {
  "managerStatus": "APPROVED",
  "managerRating": 3,
  "managerComments": "Good progress, but I think a 3/5 is more accurate. Let's work on advanced concepts."
}
```
- [ ] Status: 200 OK
- [ ] managerStatus: APPROVED
- [ ] managerRating: 3 (changed from 4)
- [ ] managerComments saved

### Test 5.4: Reject Rating ✅
```
PUT http://localhost:4000/api/ratings/approve/{{ratingId}}
Headers: Authorization: Bearer {{managerToken}}
Body: {
  "managerStatus": "REJECTED",
  "managerComments": "Please provide more specific examples before re-submitting."
}
```
- [ ] Status: 200 OK
- [ ] managerStatus: REJECTED
- [ ] managerComments saved
- [ ] Employee must re-submit

### Test 5.5: View Team Ratings ✅
```
GET http://localhost:4000/api/ratings/team
Headers: Authorization: Bearer {{managerToken}}
```
- [ ] Status: 200 OK
- [ ] Shows all ratings for team members
- [ ] Includes John's ratings
- [ ] Shows both pending and approved

### Test 5.6: Get Direct Reports ✅
```
GET http://localhost:4000/api/employees
Headers: Authorization: Bearer {{managerToken}}
```
- [ ] Status: 200 OK
- [ ] Shows John (Sarah's direct report)
- [ ] Includes employee details
- [ ] Includes skill ratings

---

## 📝 SECTION 6: NEGATIVE TESTS (4 requests)

### Test 6.1: Employee Try to Create Skill ❌
```
POST http://localhost:4000/api/skills
Headers: Authorization: Bearer {{employeeToken}}
Body: {
  "name": "Node.js",
  "category": "Backend"
}
```
- [ ] Status: 403 Forbidden
- [ ] Error: "HR access required"
- [ ] Skill NOT created

### Test 6.2: Manager Try to Delete Skill ❌
```
DELETE http://localhost:4000/api/skills/{{skillId}}
Headers: Authorization: Bearer {{managerToken}}
```
- [ ] Status: 403 Forbidden
- [ ] Error: "HR access required"
- [ ] Skill NOT deleted

### Test 6.3: Employee Try to Change Role ❌
```
PUT http://localhost:4000/api/admin/users/{{employeeId}}/role
Headers: Authorization: Bearer {{employeeToken}}
Body: { "role": "ADMIN" }
```
- [ ] Status: 403 Forbidden
- [ ] Error: "Admin access required"
- [ ] Role NOT changed

### Test 6.4: Manager Try to View Admin Stats ❌
```
GET http://localhost:4000/api/admin/stats
Headers: Authorization: Bearer {{managerToken}}
```
- [ ] Status: 403 Forbidden
- [ ] Error: "Admin access required"
- [ ] Stats NOT accessible

---

## 🎯 FINAL VERIFICATION

### Database Check
```sql
-- Check users and roles
SELECT email, role FROM User;
-- Should show: EMPLOYEE, MANAGER, HR, ADMIN

-- Check ratings
SELECT 
  e.firstName, 
  s.name, 
  es.selfRating, 
  es.managerRating, 
  es.managerStatus 
FROM EmployeeSkill es
JOIN Employee e ON es.employeeId = e.id
JOIN Skill s ON es.skillId = s.id;
-- Should show: John, JavaScript, 4, 3, APPROVED
```
- [ ] All users exist with correct roles
- [ ] Reporting relationships established
- [ ] Skills created
- [ ] Rating workflow complete

### Employee Verification
- [ ] John can view his approved rating
- [ ] Rating shows:
  - [ ] Self-rating: 4
  - [ ] Manager rating: 3
  - [ ] Manager comments: visible
  - [ ] Status: APPROVED

### Access Control Verification
- [ ] All negative tests returned 403
- [ ] No unauthorized access granted
- [ ] Proper error messages returned

---

## ✅ COMPLETION CHECKLIST

### Backend Status
- [x] ✅ Server running
- [x] ✅ Database created
- [x] ✅ All routes registered
- [x] ✅ Middleware working

### Testing Status
- [ ] ⏳ Section 1: Registration (4/4)
- [ ] ⏳ Section 2: Admin Setup (6/6)
- [ ] ⏳ Section 3: HR Skills (6/6)
- [ ] ⏳ Section 4: Employee Rating (4/4)
- [ ] ⏳ Section 5: Manager Approval (6/6)
- [ ] ⏳ Section 6: Negative Tests (4/4)

### Workflow Status
- [ ] ⏳ Complete registration flow
- [ ] ⏳ Role assignment working
- [ ] ⏳ Skill management working
- [ ] ⏳ Self-rating working
- [ ] ⏳ Manager approval working
- [ ] ⏳ Access control enforced

---

## 🎉 SUCCESS CRITERIA

All items below must be ✅ for system to be production-ready:

- [ ] All 30 API requests successful
- [ ] All positive tests return 200/201
- [ ] All negative tests return 403
- [ ] Employee can self-rate
- [ ] Manager can approve/reject
- [ ] HR can manage skills
- [ ] Admin can assign roles
- [ ] Database relationships correct
- [ ] No server errors
- [ ] Documentation complete

---

## 📞 If Issues Found

### Common Problems & Solutions

**Problem:** 403 Forbidden on valid request
- Check token is correct for the role
- Verify role was assigned by admin
- Check Authorization header format

**Problem:** 404 Not Found
- Verify IDs exist (use GET requests first)
- Check collection variables are set
- Verify database has data

**Problem:** 400 Bad Request
- Check rating is 1-5
- Verify all required fields present
- Check JSON syntax

**Problem:** Token expired
- Re-login to get fresh token
- Tokens expire in 7 days

---

**Testing Started:** __________
**Testing Completed:** __________
**Status:** ⏳ In Progress / ✅ Complete
**Tester:** __________
