const WeeklyReview = require('../models/WeeklyReview');
const Achievement = require('../models/Achievement');

// Get ISO week string
const getISOWeek = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
};

// @route   POST /api/reviews
exports.saveReview = async (req, res, next) => {
  try {
    const { wins, failures, improvements } = req.body;
    const week = getISOWeek(new Date());

    const review = await WeeklyReview.findOneAndUpdate(
      { userId: req.userId, week },
      { userId: req.userId, week, wins, failures, improvements },
      { upsert: true, new: true, runValidators: true }
    );

    // Unlock achievement
    await Achievement.findOneAndUpdate(
      { userId: req.userId, achievement: 'weekly_review_completed' },
      { userId: req.userId, achievement: 'weekly_review_completed', unlockedAt: new Date() },
      { upsert: true }
    );

    res.json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/reviews
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await WeeklyReview.find({ userId: req.userId }).sort({ createdAt: -1 });
    
    // Check if this week's review exists
    const currentWeek = getISOWeek(new Date());
    const hasCurrentWeekReview = reviews.some(r => r.week === currentWeek);
    const isSunday = new Date().getDay() === 0;

    res.json({
      success: true,
      reviews,
      showPrompt: isSunday && !hasCurrentWeekReview,
      currentWeek
    });
  } catch (error) {
    next(error);
  }
};
