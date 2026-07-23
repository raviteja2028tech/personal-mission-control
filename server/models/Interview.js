const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  stage: { type: String, enum: ['applied', 'screening', 'technical', 'system_design', 'hr', 'offer', 'rejected'], default: 'applied' },
  appliedDate: { type: Date, default: Date.now },
  nextRoundDate: { type: Date, default: null },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
