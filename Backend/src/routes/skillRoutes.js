const express = require("express");
const router = express.Router();
const {
  createSkill,
  getSkills,
  requestSkill,
  updateEmployeeSkillStatus,
  getMySkills,
  getAllEmployeeSkillRequests,
} = require("../controllers/skillController");

const { authenticateToken, isAdmin } = require("../middlewares/authMiddleware");

// ----------------- Admin: create global skill -----------------
router.post("/", authenticateToken, isAdmin, createSkill);

// ----------------- Public: get all skills -----------------
router.get("/", getSkills);

// ----------------- Employee: request a skill -----------------
router.post("/request", authenticateToken, requestSkill);

// ----------------- Employee: view own skills -----------------
router.get("/my", authenticateToken, getMySkills);

// ----------------- Admin: view all employee skill requests -----------------
router.get("/requests", authenticateToken, isAdmin, getAllEmployeeSkillRequests);

// ----------------- Admin: approve/reject a skill request -----------------
router.patch("/requests/:id", authenticateToken, isAdmin, updateEmployeeSkillStatus);

module.exports = router;
