const mongoose = require('mongoose');

const aiUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  feature: { type: String, required: true },
  provider: { type: String, enum: ['openai', 'gemini', 'anthropic', 'local'], default: 'openai' },
  promptTokens: { type: Number, default: 0 },
  completionTokens: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  estimatedCostUSD: { type: Number, default: 0 }
}, {
  timestamps: true
});

aiUsageSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AIUsage', aiUsageSchema);
