const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProgress, getHeatmap } = require('../controllers/dashboardController');

router.get('/progress', auth, getProgress);
router.get('/heatmap', auth, getHeatmap);

module.exports = router;
