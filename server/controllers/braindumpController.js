const BrainDump = require('../models/BrainDump');
const Task = require('../models/Task');
const Statistics = require('../models/Statistics');

// @route   GET /api/braindump
exports.getAllNotes = async (req, res, next) => {
  try {
    const notes = await BrainDump.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, notes });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/braindump
exports.createNote = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    const note = await BrainDump.create({ userId: req.userId, text });
    res.status(201).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/braindump/:id/convert
exports.convertToTask = async (req, res, next) => {
  try {
    const note = await BrainDump.findOne({ _id: req.params.id, userId: req.userId });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (note.converted) {
      return res.status(400).json({ success: false, message: 'Note already converted' });
    }

    // Create task from note, allowing overrides from body
    const taskData = {
      userId: req.userId,
      title: req.body.title || note.text.substring(0, 200),
      description: req.body.description || note.text,
      priority: req.body.priority || 'medium',
      dueDate: req.body.dueDate || null,
      estimatedTime: req.body.estimatedTime || 30,
      projectId: req.body.projectId || null,
      why: req.body.why || ''
    };

    const task = await Task.create(taskData);

    // Mark note as converted
    note.converted = true;
    note.convertedTaskId = task._id;
    await note.save();

    // Update stats
    await Statistics.findOneAndUpdate(
      { userId: req.userId },
      { $inc: { totalTasks: 1 } }
    );

    res.status(201).json({ success: true, task, note });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/braindump/:id
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await BrainDump.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};
