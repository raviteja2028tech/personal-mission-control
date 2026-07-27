const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getLearningItems, createLearningItem, updateLearningItem, deleteLearningItem,
  getInterviews, createInterview, updateInterview, deleteInterview,
  generateResumeBullets
} = require('../controllers/careerController');

router.get('/learning', auth, getLearningItems);
router.post('/learning', auth, createLearningItem);
router.put('/learning/:id', auth, updateLearningItem);
router.delete('/learning/:id', auth, deleteLearningItem);

router.get('/interviews', auth, getInterviews);
router.post('/interviews', auth, createInterview);
router.put('/interviews/:id', auth, updateInterview);
router.delete('/interviews/:id', auth, deleteInterview);

router.get('/resume-bullets', auth, generateResumeBullets);

module.exports = router;
