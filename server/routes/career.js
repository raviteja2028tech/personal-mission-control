const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getLearningItems, createLearningItem,
  getInterviews, createInterview,
  generateResumeBullets
} = require('../controllers/careerController');

router.get('/learning', auth, getLearningItems);
router.post('/learning', auth, createLearningItem);

router.get('/interviews', auth, getInterviews);
router.post('/interviews', auth, createInterview);

router.get('/resume-bullets', auth, generateResumeBullets);

module.exports = router;
