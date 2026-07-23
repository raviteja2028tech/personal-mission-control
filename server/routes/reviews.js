const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { saveReview, getReviews } = require('../controllers/reviewController');

router.post('/', auth, saveReview);
router.get('/', auth, getReviews);

module.exports = router;
