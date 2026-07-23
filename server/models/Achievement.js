const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  achievement: {
    type: String,
    required: true,
    enum: ['first_task', 'hundred_tasks', 'ten_day_streak', 'project_completed', 'weekly_review_completed']
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

achievementSchema.index({ userId: 1, achievement: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
