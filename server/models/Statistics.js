const mongoose = require('mongoose');

const dailyCompletionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  count: { type: Number, default: 0 }
}, { _id: false });

const statisticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  totalTasks: {
    type: Number,
    default: 0
  },
  completedTasks: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastCompletionDate: {
    type: Date,
    default: null
  },
  deepWorkHours: {
    type: Number,
    default: 0
  },
  deepWorkSessions: {
    type: Number,
    default: 0
  },
  dailyCompletions: [dailyCompletionSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Statistics', statisticsSchema);
