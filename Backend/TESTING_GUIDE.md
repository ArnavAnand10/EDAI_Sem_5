# 🧪 Complete Testing Guide for Demo

## 📥 How to Import Postman Collection

1. **Open Postman**
2. Click **Import** button (top left)
3. **Select File**: `Backend/Postman_Collection.json`
4. Collection will be imported with 9 workflow sections

---

## 🚀 Quick Start - Testing in Order

### Prerequisites
```powershell
# Start the backend server
cd Backend
npm start
# Server should run on http://localhost:4000
```

---

## 📋 Complete Workflow Testing (Step by Step)

### **SECTION 1: Setup - Create Test Data** 🎬

Run these in order to create all test users:

1. **1.1 Register System Admin** ✅
   - Creates system admin account
   - Saves token automatically
   
2. **1.2 Register HR Admin** ✅
   - Creates HR admin account
   - Saves token automatically

3. **1.3 Register Manager Manager** ✅
   - Creates director/manager's manager
   - Saves token automatically

4. **1.4 Register Manager** ✅
   - Creates manager account
   - Saves token automatically

5. **1.5 Register Employee** ✅
   - Creates employee account
   - Saves token and employee ID automatically

**Expected Result**: All 5 users created with tokens saved

---

### **SECTION 2: Authentication - Login** 🔐

Test re-login for any user:

1. **2.1 Login as Employee**
2. **2.2 Login as Manager**
3. **2.3 Login as HR Admin**

**Expected Result**: Returns JWT token for each user

---

### **SECTION 3: HR ADMIN Workflow** 👔

Demonstrates HR administrator capabilities:

1. **3.1 Create Skill - JavaScript** ⭐
   - HR creates JavaScript skill with weightage 8
   - Skill ID saved automatically

2. **3.2 Create Skill - Python**
   - Creates Python skill with weightage 9

3. **3.3 Create Skill - React**
   - Creates React skill with weightage 7

4. **3.4 Update Skill Weightage** 📊
   - Changes JavaScript weightage to 10
   - **Proves**: Only HR can change weightage

5. **3.5 Update Employee Demographics** 📝
   - Updates employee's department, position, location
   - **Proves**: Only HR can modify demographics

6. **3.6 Get All Skill Data** 📊
   - HR views complete skill data
   - **Proves**: Only HR has full data access

7. **3.7 Get Skill Distribution Report** 📈
   - Shows skill distribution across organization

8. **3.8 Get Employee Skill Summary** 📋
   - Employee-wise skill summary

9. **3.9 Get Department Analysis** 🏢
   - Department-wise skill analysis

**Expected Results**:
- HR can create/update/delete skills ✅
- HR can change demographics ✅
- HR can view all reports ✅

---

### **SECTION 4: EMPLOYEE Workflow - Self Rating** 👤

Demonstrates employee capabilities and restrictions:

1. **4.1 Get My Profile**
   - Employee views their profile

2. **4.2 Get All Skills (Public)**
   - Views available skills (no auth needed)

3. **4.3 Self-Rate JavaScript Skill** ⭐⭐⭐
   - Employee rates themselves 4/5 on JavaScript
   - Adds comments about experience
   - EmployeeSkill ID saved automatically
   - **Status**: IN_REVIEW

4. **4.4 View My Ratings (Before Approval)** 👁️
   - Employee checks their rating
   - **Expected**: Can see self-rating ONLY
   - **Cannot see**: Manager rating (not approved yet)

5. **4.5 Try to Change Demographics (FAIL)** ❌
   - Employee tries to change department
   - **Expected**: 403 Error - Access Denied
   - **Proves**: Employees cannot change demographics

**Expected Results**:
- Employee can self-rate ✅
- Employee sees only self-rating before approval ✅
- Employee CANNOT change demographics ❌ (correct)

---

### **SECTION 5: MANAGER Workflow - Approval** 👨‍💼

Demonstrates manager capabilities:

1. **5.1 Get Pending Approvals** 📬
   - Manager sees employee's pending skill rating
   - Shows employee's self-rating and comments

2. **5.2 View Team Ratings** 👥
   - Manager views all team skill ratings

3. **5.3 Approve Employee Skill Rating** ✅
   - Manager reviews employee's JavaScript rating
   - Manager gives own rating: 4/5
   - Adds feedback comments
   - **Status**: APPROVED or IN_REVIEW (if MM exists)

4. **5.4 Reject a Rating (Example)** ❌
   - Shows how manager can reject
   - With explanation comments

5. **5.5 Modify and Approve** ✏️
   - Manager changes rating to 3/5
   - Provides reasoning
   - Status: MODIFIED

6. **5.6 Search Skills - Find Python Experts** 🔍
   - Manager searches for Python skills
   - Filters by minimum rating 4
   - **Proves**: Managers can search org-wide

7. **5.7 Try to Change Demographics (FAIL)** ❌
   - Manager tries to change employee department
   - **Expected**: 403 Error
   - **Proves**: Managers cannot change demographics

**Expected Results**:
- Manager can view pending approvals ✅
- Manager can approve/reject/modify ratings ✅
- Manager can search skills across org ✅
- Manager CANNOT change demographics ❌ (correct)

---

### **SECTION 6: MANAGER'S MANAGER Workflow** 👔👔

Demonstrates final approval authority:

1. **6.1 Get Pending Approvals (Level 2)** 📬
   - Shows ratings approved by manager
   - Pending Manager's Manager approval

2. **6.2 Final Approval by Manager's Manager** ✅✅
   - MM reviews rating
   - Gives final rating: 4/5
   - Provides final comments
   - **Status**: APPROVED (FINAL)
   - **Final Rating**: Set to 4

3. **6.3 Search Skills Across Organization** 🔍
   - MM can also search skills org-wide

**Expected Results**:
- MM sees only manager-approved ratings ✅
- MM provides final approval ✅
- Status becomes APPROVED ✅
- Final rating is set ✅

---

### **SECTION 7: EMPLOYEE - View Approved Rating** 👁️✅

1. **7.1 View My Ratings (After Approval)** 🎉
   - Employee checks ratings again
   - **Now sees**:
     - ✅ Self-rating (4/5)
     - ✅ Manager rating (4/5) with comments
     - ✅ Manager's Manager rating (4/5) with comments
     - ✅ Final approved rating (4/5)
   - **Proves**: Employee sees ratings only after approval

**Expected Result**: Employee now sees complete approved rating history

---

### **SECTION 8: SYSTEM ADMIN Workflow** 🔧

Demonstrates system administrator capabilities:

1. **8.1 Get System Stats** 📊
   - User counts by role
   - Employee counts by department
   - Skill statistics
   - Activity metrics

2. **8.2 Get Audit Logs** 📜
   - Views all system activities
   - Filter by user, action, entity

3. **8.3 Get Security Audit** 🛡️
   - Failed login attempts
   - Unauthorized access attempts
   - Suspicious IPs
   - Admin modifications

4. **8.4 Create System Backup** 💾
   - Creates JSON backup of all data
   - Backup saved in Backend/backups/

5. **8.5 Get Backups History** 📚
   - Lists all backups created

**Expected Results**:
- System admin has full visibility ✅
- Can create backups ✅
- Can view security audits ✅

---

### **SECTION 9: NEGATIVE TESTS - Access Denied** ❌

Tests to verify security is working:

1. **9.1 Employee Try to Create Skill (FAIL)** ❌
   - **Expected**: 403 - HR or System Admin access required

2. **9.2 Manager Try to Delete Skill (FAIL)** ❌
   - **Expected**: 403 - HR or System Admin access required

3. **9.3 Employee Try to View Team Ratings (FAIL)** ❌
   - **Expected**: 403 - Manager or above access required

4. **9.4 Manager Try System Backup (FAIL)** ❌
   - **Expected**: 403 - System Administrator access required

**Expected Results**: All should return 403 Forbidden ✅

---

## 📊 Complete Workflow Summary

```
1. HR Admin creates skills with weightage
        ↓
2. Employee self-rates skill (4/5)
        ↓
3. Employee sees only self-rating
        ↓
4. Manager views pending approvals
        ↓
5. Manager approves with rating (4/5)
        ↓
6. Manager's Manager sees pending
        ↓
7. Manager's Manager gives final approval (4/5)
        ↓
8. Employee now sees complete rating history
        ↓
9. System Admin monitors everything
```

---

## 🎯 Key Testing Points

### ✅ **Demographic Protection**
- ❌ Employee CANNOT change demographics
- ❌ Manager CANNOT change demographics
- ❌ Manager's Manager CANNOT change demographics
- ✅ HR Admin CAN change demographics
- ✅ System Admin CAN change demographics

### ✅ **Rating Visibility**
- Before approval: Employee sees ONLY self-rating
- After manager approval: Employee sees manager rating
- After MM approval: Employee sees final rating

### ✅ **Skill Management**
- ❌ Only HR can create skills
- ❌ Only HR can delete skills
- ❌ Only HR can change weightage
- ✅ Anyone can view skills (public)

### ✅ **Search & Reports**
- Managers: Can search skills across org
- HR Admin: Can pull all reports
- Employees: No search access

### ✅ **System Functions**
- ❌ Only System Admin can backup
- ❌ Only System Admin can view audit logs
- ❌ Only System Admin can view security audit

---

## 🔥 Demo Script (5 Minutes)

### **Minute 1: HR Admin Setup**
```
1. Login as HR Admin
2. Create JavaScript skill (weightage 8)
3. Update employee demographics (department, position)
   → Shows: Only HR can modify demographics
```

### **Minute 2: Employee Self-Rating**
```
1. Login as Employee
2. Self-rate JavaScript (4/5) with comments
3. View my ratings → Shows only self-rating
4. Try to change demographics → FAILS (403)
   → Shows: Employees cannot change demographics
```

### **Minute 3: Manager Approval**
```
1. Login as Manager
2. View pending approvals → See employee's rating
3. Approve with rating (4/5) and comments
4. Search skills → Find JavaScript experts
5. Try to change demographics → FAILS (403)
   → Shows: Managers cannot change demographics
```

### **Minute 4: Manager's Manager Final Approval**
```
1. Login as Manager's Manager
2. View pending approvals → See manager-approved rating
3. Final approval with rating (4/5)
   → Rating now APPROVED with final rating set
```

### **Minute 5: Verification & Reports**
```
1. Login as Employee
2. View my ratings → NOW sees complete history:
   - Self-rating ✅
   - Manager rating ✅
   - MM rating ✅
   - Final rating ✅
   
3. Login as HR Admin
4. View skill distribution report
5. View employee summary report
   → Shows: HR has complete visibility
```

---

## 🎓 Test Accounts

| Role | Email | Password | Capabilities |
|------|-------|----------|--------------|
| **System Admin** | admin@techcorp.com | admin123 | Everything |
| **HR Admin** | hr@techcorp.com | hr123 | Demographics, Skills, Reports |
| **Manager's Manager** | director@techcorp.com | director123 | Final approvals, Search |
| **Manager** | manager@techcorp.com | manager123 | Team approvals, Search |
| **Employee** | employee@techcorp.com | emp123 | Self-rate only |

---

## 📝 Postman Tips

### Auto-Save Tokens
All login/register requests automatically save tokens to variables:
- `{{employeeToken}}`
- `{{managerToken}}`
- `{{hrToken}}`
- `{{systemAdminToken}}`

### Auto-Save IDs
Important IDs are auto-saved:
- `{{skillId}}` - First skill created
- `{{employeeId}}` - Employee ID
- `{{employeeSkillId}}` - Rating ID

### Running Tests
1. **Run folder** - Right-click folder → Run Folder
2. **Run all** - Click collection → Run
3. **Single request** - Click request → Send

---

## ✅ What to Check

After running all tests, verify:

1. ✅ **5 users created** with different roles
2. ✅ **3 skills created** with weightages
3. ✅ **1 rating created** by employee
4. ✅ **Rating approved** by manager
5. ✅ **Final approval** by manager's manager
6. ✅ **Employee sees** complete rating history
7. ✅ **Demographics protected** (only HR can change)
8. ✅ **All 403 errors** work correctly
9. ✅ **Search works** for managers
10. ✅ **Reports accessible** for HR

---

## 🎉 Success Criteria

Your demo is successful if:
- ✅ Complete rating workflow works (employee → manager → MM)
- ✅ Employees cannot change demographics
- ✅ Managers cannot change demographics
- ✅ Only HR can manage skills and demographics
- ✅ Rating visibility works correctly
- ✅ Search works for managers
- ✅ Reports work for HR
- ✅ System admin can backup and audit

---

**Ready to demo! Import the Postman collection and run Section 1 to start** 🚀
