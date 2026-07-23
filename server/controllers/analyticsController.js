const Task = require('../models/Task');
const Statistics = require('../models/Statistics');
const Project = require('../models/Project');

// @route   GET /api/analytics/daily
exports.getDailyReport = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const todayCompleted = await Task.countDocuments({
      userId: req.userId,
      status: 'done',
      completedTime: { $gte: startOfDay, $lt: endOfDay }
    });

    const todayTotal = await Task.countDocuments({
      userId: req.userId,
      dueDate: { $gte: startOfDay, $lt: endOfDay }
    });

    const todayPending = await Task.countDocuments({
      userId: req.userId,
      status: { $ne: 'done' },
      dueDate: { $gte: startOfDay, $lt: endOfDay }
    });

    res.json({
      success: true,
      report: {
        date: startOfDay.toISOString().split('T')[0],
        completed: todayCompleted,
        total: todayTotal,
        pending: todayPending,
        percentage: todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/analytics/weekly
exports.getWeeklyReport = async (req, res, next) => {
  try {
    const now = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const completed = await Task.countDocuments({
        userId: req.userId,
        status: 'done',
        completedTime: { $gte: startOfDay, $lt: endOfDay }
      });

      const created = await Task.countDocuments({
        userId: req.userId,
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      });

      days.push({
        date: startOfDay.toISOString().split('T')[0],
        dayName: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
        completed,
        created
      });
    }

    const totalCompleted = days.reduce((sum, d) => sum + d.completed, 0);
    const avgDaily = Math.round((totalCompleted / 7) * 10) / 10;

    res.json({
      success: true,
      report: { days, totalCompleted, avgDaily }
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/analytics/monthly
exports.getMonthlyReport = async (req, res, next) => {
  try {
    const now = new Date();
    const weeks = [];

    for (let i = 3; i >= 0; i--) {
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() - (i * 7));
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 7);

      const completed = await Task.countDocuments({
        userId: req.userId,
        status: 'done',
        completedTime: { $gte: startDate, $lt: endDate }
      });

      weeks.push({
        weekStart: startDate.toISOString().split('T')[0],
        weekEnd: endDate.toISOString().split('T')[0],
        completed
      });
    }

    // Project health
    const projects = await Project.find({ userId: req.userId });
    const projectHealth = await Promise.all(
      projects.map(async (p) => {
        const total = await Task.countDocuments({ userId: req.userId, projectId: p._id });
        const done = await Task.countDocuments({ userId: req.userId, projectId: p._id, status: 'done' });
        const overdue = await Task.countDocuments({
          userId: req.userId,
          projectId: p._id,
          status: { $ne: 'done' },
          dueDate: { $lt: new Date() }
        });
        return {
          name: p.name,
          color: p.color,
          total,
          completed: done,
          overdue,
          progress: total > 0 ? Math.round((done / total) * 100) : 0
        };
      })
    );

    res.json({
      success: true,
      report: { weeks, projectHealth }
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/analytics/deep-work
exports.getDeepWorkReport = async (req, res, next) => {
  try {
    const stats = await Statistics.findOne({ userId: req.userId });

    res.json({
      success: true,
      report: {
        totalHours: stats ? stats.deepWorkHours : 0,
        totalSessions: stats ? stats.deepWorkSessions : 0,
        dailyAverage: stats && stats.deepWorkSessions > 0
          ? Math.round((stats.deepWorkHours / stats.deepWorkSessions) * 10) / 10
          : 0
      }
    });
  } catch (error) {
    next(error);
  }
};
