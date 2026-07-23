const mongoose = require('mongoose');

const weeklyReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  week: {
    type: String, // ISO week format e.g. '2026-W30'
    required: true
  },
  wins: {
    type: String,
    default: ''
  },
  failures: {
    type: String,
    default: ''
  },
  improvements: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

weeklyReviewSchema.index({ userId: 1, week: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyReview', weeklyReviewSchema);
