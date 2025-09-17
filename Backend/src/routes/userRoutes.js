const express = require('express');
const router = express.Router();
const { me } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/me', authenticateToken, me);

module.exports = router;
