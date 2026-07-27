const Learning = require('../models/Learning');
const Interview = require('../models/Interview');
const Task = require('../models/Task');
const Project = require('../models/Project');

// --- Learning Endpoints ---
exports.getLearningItems = async (req, res, next) => {
  try {
    const items = await Learning.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.createLearningItem = async (req, res, next) => {
  try {
    const item = await Learning.create({ ...req.body, userId: req.userId });
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.updateLearningItem = async (req, res, next) => {
  try {
    const item = await Learning.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Learning item not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.deleteLearningItem = async (req, res, next) => {
  try {
    const item = await Learning.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ success: false, message: 'Learning item not found' });
    res.json({ success: true, message: 'Learning item deleted' });
  } catch (err) { next(err); }
};

// --- Interview Tracker Endpoints ---
exports.getInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ userId: req.userId }).sort({ appliedDate: -1 });
    res.json({ success: true, data: interviews });
  } catch (err) { next(err); }
};

exports.createInterview = async (req, res, next) => {
  try {
    const interview = await Interview.create({ ...req.body, userId: req.userId });
    res.status(201).json({ success: true, data: interview });
  } catch (err) { next(err); }
};

exports.updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    res.json({ success: true, data: interview });
  } catch (err) { next(err); }
};

exports.deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    res.json({ success: true, message: 'Interview deleted' });
  } catch (err) { next(err); }
};

// --- AI Resume Bullet Point Builder ---
exports.generateResumeBullets = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.userId });
    const completedTasks = await Task.find({ userId: req.userId, status: 'done' }).limit(10);

    const bullets = projects.map(p => ({
      project: p.name,
      bullet: `Engineered and delivered the '${p.name}' system using full-stack web architecture, completing multi-phase milestones with high execution efficiency.`
    }));

    if (bullets.length === 0) {
      bullets.push({
        project: 'Personal Mission Control',
        bullet: 'Architected an AI-powered productivity system with real-time analytics, task prioritization matrix, and modular micro-services.'
      });
    }

    res.json({ success: true, data: { bullets } });
  } catch (err) { next(err); }
};
