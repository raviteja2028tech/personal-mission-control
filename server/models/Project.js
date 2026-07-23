const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: 100
  },
  color: {
    type: String,
    default: '#6366f1' // indigo default
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

projectSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Project', projectSchema);
