const User = require('../models/User');

// @route   GET /api/users/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/users/me
exports.updateMe = async (req, res, next) => {
  try {
    const { name, profile, settings } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (profile) {
      if (profile.avatar !== undefined) user.profile.avatar = profile.avatar;
      if (profile.bio !== undefined) user.profile.bio = profile.bio;
    }
    if (settings) {
      if (settings.theme !== undefined) user.settings.theme = settings.theme;
      if (settings.pomodoroWork !== undefined) user.settings.pomodoroWork = settings.pomodoroWork;
      if (settings.pomodoroBreak !== undefined) user.settings.pomodoroBreak = settings.pomodoroBreak;
    }

    await user.save({ validateBeforeSave: true });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
