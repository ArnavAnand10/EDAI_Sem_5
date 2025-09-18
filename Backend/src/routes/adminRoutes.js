const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        createdAt: true,
        employees: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    res.json(admins);
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
