const Task = require('../models/Task');
const Statistics = require('../models/Statistics');
const getSmartPriority = require('../utils/smartPriority');
const calculateMentalLoad = require('../utils/mentalLoad');

// @route   GET /api/dashboard/progress
exports.getProgress = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Get all pending tasks for smart priority and mental load
    const allTasks = await Task.find({ userId }).populate('projectId', 'name color');
    const pendingTasks = allTasks.filter(t => t.status !== 'done');

    // Today's tasks
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const todayTasks = allTasks.filter(t => {
      if (!t.dueDate) return false;
      return t.dueDate >= startOfDay && t.dueDate < endOfDay;
    });
    const todayCompleted = todayTasks.filter(t => t.status === 'done').length;
    const todayTotal = todayTasks.length;
    const todayPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    // Today's estimated work hours
    const todayPendingMinutes = todayTasks
      .filter(t => t.status !== 'done')
      .reduce((sum, t) => sum + (t.estimatedTime || 30), 0);
    const todayEstimatedHours = Math.round((todayPendingMinutes / 60) * 10) / 10;

    // Top 3 missions
    const topMissions = getSmartPriority(pendingTasks, 3);

    // Mental load
    const mentalLoad = calculateMentalLoad(allTasks);

    // Overall stats
    const stats = await Statistics.findOne({ userId });

    // Overall completion percentage
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'done').length;
    const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Time-based greeting
    const hour = now.getHours();
    let greeting;
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 17) greeting = 'Good Afternoon';
    else greeting = 'Good Evening';

    res.json({
      success: true,
      dashboard: {
        greeting,
        userName: req.user.name,
        todayPercentage,
        todayCompleted,
        todayTotal,
        todayEstimatedHours,
        overallPercentage,
        totalTasks,
        completedTasks,
        topMissions,
        mentalLoad,
        streak: stats ? stats.streak : 0,
        longestStreak: stats ? stats.longestStreak : 0,
        deepWorkHours: stats ? stats.deepWorkHours : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/dashboard/heatmap
exports.getHeatmap = async (req, res, next) => {
  try {
    const stats = await Statistics.findOne({ userId: req.userId });

    if (!stats || !stats.dailyCompletions) {
      return res.json({ success: true, heatmap: [] });
    }

    // Return last 365 days of data
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const heatmap = stats.dailyCompletions
      .filter(d => new Date(d.date) >= oneYearAgo)
      .map(d => ({
        date: d.date.toISOString().split('T')[0],
        count: d.count
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ success: true, heatmap });
  } catch (error) {
    next(error);
  }
};
