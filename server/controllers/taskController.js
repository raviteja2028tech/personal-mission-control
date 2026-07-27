const Task = require('../models/Task');
const Statistics = require('../models/Statistics');
const Achievement = require('../models/Achievement');

// Helper: check and unlock achievements
const checkAchievements = async (userId) => {
  const stats = await Statistics.findOne({ userId });
  if (!stats) return;

  const achievements = [];

  if (stats.completedTasks >= 1) {
    achievements.push({ userId, achievement: 'first_task' });
  }
  if (stats.completedTasks >= 100) {
    achievements.push({ userId, achievement: 'hundred_tasks' });
  }
  if (stats.streak >= 10) {
    achievements.push({ userId, achievement: 'ten_day_streak' });
  }

  for (const a of achievements) {
    await Achievement.findOneAndUpdate(
      { userId: a.userId, achievement: a.achievement },
      { userId: a.userId, achievement: a.achievement, unlockedAt: new Date() },
      { upsert: true, new: true }
    );
  }
};

// Helper: update streak
const updateStreak = async (userId) => {
  const stats = await Statistics.findOne({ userId });
  if (!stats) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (stats.lastCompletionDate) {
    const lastDate = new Date(stats.lastCompletionDate);
    const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    const diffDays = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already completed today, no streak change
      return;
    } else if (diffDays === 1) {
      // Consecutive day
      stats.streak += 1;
    } else {
      // Streak broken
      stats.streak = 1;
    }
  } else {
    stats.streak = 1;
  }

  if (stats.streak > stats.longestStreak) {
    stats.longestStreak = stats.streak;
  }
  stats.lastCompletionDate = today;

  // Update daily completions for heatmap
  const existingDay = stats.dailyCompletions.find(d => {
    const dDate = new Date(d.date);
    return new Date(dDate.getFullYear(), dDate.getMonth(), dDate.getDate()).getTime() === today.getTime();
  });

  if (existingDay) {
    existingDay.count += 1;
  } else {
    stats.dailyCompletions.push({ date: today, count: 1 });
  }

  await stats.save();
};

// @route   POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const taskData = { ...req.body, userId: req.userId };
    const task = await Task.create(taskData);

    // Update total tasks count
    await Statistics.findOneAndUpdate(
      { userId: req.userId },
      { $inc: { totalTasks: 1 } }
    );

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Update total tasks count
    const decrement = { totalTasks: -1 };
    if (task.status === 'done') decrement.completedTasks = -1;
    await Statistics.findOneAndUpdate({ userId: req.userId }, { $inc: decrement });

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/tasks/:id/complete
exports.completeTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status === 'done') {
      return res.status(400).json({ success: false, message: 'Task already completed' });
    }

    task.status = 'done';
    task.completedTime = new Date();
    await task.save();

    // Update statistics
    await Statistics.findOneAndUpdate(
      { userId: req.userId },
      { $inc: { completedTasks: 1 } }
    );

    // Update streak
    await updateStreak(req.userId);

    // Check achievements
    await checkAchievements(req.userId);

    // Check if project completed
    if (task.projectId) {
      const remainingTasks = await Task.countDocuments({
        userId: req.userId,
        projectId: task.projectId,
        status: { $ne: 'done' }
      });

      if (remainingTasks === 0) {
        const totalInProject = await Task.countDocuments({
          userId: req.userId,
          projectId: task.projectId
        });

        if (totalInProject > 0) {
          await Achievement.findOneAndUpdate(
            { userId: req.userId, achievement: 'project_completed' },
            { userId: req.userId, achievement: 'project_completed', unlockedAt: new Date() },
            { upsert: true }
          );
        }
      }
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/tasks/today
exports.getTodayTasks = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const tasks = await Task.find({
      userId: req.userId,
      dueDate: { $gte: startOfDay, $lt: endOfDay }
    }).populate('projectId', 'name color').sort({ priority: 1 });

    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/tasks/search?q=keyword
exports.searchTasks = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }

    const tasks = await Task.find({
      userId: req.userId,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { why: { $regex: q, $options: 'i' } }
      ]
    }).populate('projectId', 'name color').sort({ createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/tasks/filter
exports.filterTasks = async (req, res, next) => {
  try {
    const { project, priority, status, startDate, endDate, sort } = req.query;
    const query = { userId: req.userId };

    if (project) query.projectId = project;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) query.dueDate.$gte = new Date(startDate);
      if (endDate) query.dueDate.$lte = new Date(endDate);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'dueDate') sortOption = { dueDate: 1 };
    if (sort === 'priority') sortOption = { priority: 1 };
    if (sort === 'createdAt') sortOption = { createdAt: -1 };

    const tasks = await Task.find(query)
      .populate('projectId', 'name color')
      .sort(sortOption);

    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/tasks (get all tasks for user)
exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.userId })
      .populate('projectId', 'name color')
      .sort({ createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/tasks/:id (get single task)
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId }).populate('projectId', 'name color');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};
