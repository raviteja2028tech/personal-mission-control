const mongoose = require('mongoose');

const brainDumpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  text: {
    type: String,
    required: [true, 'Note text is required'],
    maxlength: 2000
  },
  date: {
    type: Date,
    default: Date.now
  },
  converted: {
    type: Boolean,
    default: false
  },
  convertedTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BrainDump', brainDumpSchema);
