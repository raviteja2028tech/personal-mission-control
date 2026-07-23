const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDailyReport, getWeeklyReport, getMonthlyReport, getDeepWorkReport } = require('../controllers/analyticsController');

router.get('/daily', auth, getDailyReport);
router.get('/weekly', auth, getWeeklyReport);
router.get('/monthly', auth, getMonthlyReport);
router.get('/deep-work', auth, getDeepWorkReport);

module.exports = router;
