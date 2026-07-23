const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  stripeCustomerId: { type: String, default: null },
  stripeSubscriptionId: { type: String, default: null },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  status: { type: String, enum: ['active', 'canceled', 'past_due', 'none'], default: 'none' },
  currentPeriodEnd: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
