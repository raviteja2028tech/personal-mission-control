const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAchievements, unlockAchievement } = require('../controllers/achievementController');

router.get('/', auth, getAchievements);
router.post('/unlock', auth, unlockAchievement);

module.exports = router;
