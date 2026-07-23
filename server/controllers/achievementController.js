const Achievement = require('../models/Achievement');

const ACHIEVEMENT_DEFINITIONS = {
  first_task: { name: 'First Task', description: 'Complete your first task', icon: '🎯' },
  hundred_tasks: { name: '100 Tasks', description: 'Complete 100 tasks', icon: '💯' },
  ten_day_streak: { name: '10-Day Streak', description: 'Maintain a 10-day streak', icon: '🔥' },
  project_completed: { name: 'Project Completed', description: 'Complete all tasks in a project', icon: '🏆' },
  weekly_review_completed: { name: 'Weekly Review', description: 'Complete a weekly review', icon: '📝' }
};

// @route   GET /api/achievements
exports.getAchievements = async (req, res, next) => {
  try {
    const unlocked = await Achievement.find({ userId: req.userId });
    const unlockedMap = {};
    unlocked.forEach(a => { unlockedMap[a.achievement] = a.unlockedAt; });

    const achievements = Object.entries(ACHIEVEMENT_DEFINITIONS).map(([key, def]) => ({
      id: key,
      ...def,
      unlocked: !!unlockedMap[key],
      unlockedAt: unlockedMap[key] || null
    }));

    res.json({ success: true, achievements });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/achievements/unlock
exports.unlockAchievement = async (req, res, next) => {
  try {
    const { achievement } = req.body;

    if (!ACHIEVEMENT_DEFINITIONS[achievement]) {
      return res.status(400).json({ success: false, message: 'Invalid achievement' });
    }

    const result = await Achievement.findOneAndUpdate(
      { userId: req.userId, achievement },
      { userId: req.userId, achievement, unlockedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, achievement: result });
  } catch (error) {
    next(error);
  }
};
