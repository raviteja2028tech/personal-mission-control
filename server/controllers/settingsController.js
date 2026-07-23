const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const BrainDump = require('../models/BrainDump');
const WeeklyReview = require('../models/WeeklyReview');
const Achievement = require('../models/Achievement');
const Statistics = require('../models/Statistics');

// @route   GET /api/settings
exports.getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    res.json({
      success: true,
      settings: user.settings
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/settings
exports.updateSettings = async (req, res, next) => {
  try {
    const { theme, pomodoroWork, pomodoroBreak } = req.body;
    const updateData = {};
    if (theme) updateData['settings.theme'] = theme;
    if (pomodoroWork) updateData['settings.pomodoroWork'] = pomodoroWork;
    if (pomodoroBreak) updateData['settings.pomodoroBreak'] = pomodoroBreak;

    const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true });
    res.json({ success: true, settings: user.settings });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/settings/export
exports.exportData = async (req, res, next) => {
  try {
    const userId = req.userId;
    const [tasks, projects, brainDumps, reviews, achievements, statistics] = await Promise.all([
      Task.find({ userId }),
      Project.find({ userId }),
      BrainDump.find({ userId }),
      WeeklyReview.find({ userId }),
      Achievement.find({ userId }),
      Statistics.findOne({ userId })
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: { tasks, projects, brainDumps, reviews, achievements, statistics }
    };

    res.json({ success: true, export: exportData });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/settings/import
exports.importData = async (req, res, next) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, message: 'No data provided' });
    }

    const userId = req.userId;

    // Clear existing data
    await Promise.all([
      Task.deleteMany({ userId }),
      Project.deleteMany({ userId }),
      BrainDump.deleteMany({ userId }),
      WeeklyReview.deleteMany({ userId }),
      Achievement.deleteMany({ userId }),
      Statistics.deleteMany({ userId })
    ]);

    // Import new data with userId overridden
    if (data.tasks) {
      await Task.insertMany(data.tasks.map(t => ({ ...t, _id: undefined, userId })));
    }
    if (data.projects) {
      await Project.insertMany(data.projects.map(p => ({ ...p, _id: undefined, userId })));
    }
    if (data.brainDumps) {
      await BrainDump.insertMany(data.brainDumps.map(b => ({ ...b, _id: undefined, userId })));
    }
    if (data.reviews) {
      await WeeklyReview.insertMany(data.reviews.map(r => ({ ...r, _id: undefined, userId })));
    }
    if (data.achievements) {
      await Achievement.insertMany(data.achievements.map(a => ({ ...a, _id: undefined, userId })));
    }
    if (data.statistics) {
      await Statistics.create({ ...data.statistics, _id: undefined, userId });
    }

    res.json({ success: true, message: 'Data imported successfully' });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/settings/deep-work
exports.logDeepWork = async (req, res, next) => {
  try {
    const { hours } = req.body;
    if (typeof hours !== 'number' || hours <= 0) {
      return res.status(400).json({ success: false, message: 'Valid hours required' });
    }

    const stats = await Statistics.findOneAndUpdate(
      { userId: req.userId },
      { $inc: { deepWorkHours: hours, deepWorkSessions: 1 } },
      { new: true }
    );

    res.json({ success: true, deepWork: { hours: stats.deepWorkHours, sessions: stats.deepWorkSessions } });
  } catch (error) {
    next(error);
  }
};
