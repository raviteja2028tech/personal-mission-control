const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSettings, updateSettings, exportData, importData, logDeepWork } = require('../controllers/settingsController');

router.get('/', auth, getSettings);
router.put('/', auth, updateSettings);
router.get('/export', auth, exportData);
router.post('/import', auth, importData);
router.patch('/deep-work', auth, logDeepWork);

module.exports = router;
