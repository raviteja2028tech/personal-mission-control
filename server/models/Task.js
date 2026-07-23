const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { _id: true });

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    default: '',
    maxlength: 2000
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done', 'overdue'],
    default: 'todo'
  },
  dueDate: {
    type: Date,
    default: null
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 30
  },
  completedTime: {
    type: Date,
    default: null
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  why: {
    type: String,
    default: '',
    maxlength: 500
  },
  subtasks: [subtaskSchema],
  notes: {
    type: String,
    default: '',
    maxlength: 5000
  }
}, {
  timestamps: true
});

// Index for common queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, projectId: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', taskSchema);
