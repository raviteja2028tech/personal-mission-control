const mongoose = require('mongoose');

const learningSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, enum: ['course', 'book', 'problem_set', 'project', 'certification'], default: 'course' },
  platform: { type: String, default: '' },
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'in_progress' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Learning', learningSchema);
