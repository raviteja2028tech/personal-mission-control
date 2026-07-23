const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  generateDailyPlan,
  breakdownGoal,
  smartPrioritize,
  streamCoachResponse,
  getPredictiveAnalytics
} = require('../controllers/aiController');

router.post('/daily-plan', auth, generateDailyPlan);
router.post('/goal-breakdown', auth, breakdownGoal);
router.post('/smart-priority', auth, smartPrioritize);
router.get('/coach/stream', auth, streamCoachResponse);
router.get('/predictive-analytics', auth, getPredictiveAnalytics);

module.exports = router;
