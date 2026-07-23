const aiService = require('../utils/ai/aiService');
const promptManager = require('../utils/ai/promptManager');
const Task = require('../models/Task');
const Statistics = require('../models/Statistics');
const AIUsage = require('../models/AIUsage');

// @route   POST /api/v1/ai/daily-plan
exports.generateDailyPlan = async (req, res, next) => {
  try {
    const userId = req.userId;
    const tasks = await Task.find({ userId, status: { $ne: 'done' } });
    const stats = await Statistics.findOne({ userId });

    const promptObj = promptManager.getPrompt('DAILY_PLANNER', {
      tasks,
      streak: stats ? stats.streak : 0,
      energyLevel: req.body.energyLevel || 'High',
      workingHours: req.body.workingHours || '9 AM - 6 PM'
    });

    const schema = {
      priorities: ["array"],
      timeBlocks: ["array"],
      riskAnalysis: "string",
      estimatedCompletionTime: "string"
    };

    const plan = await aiService.generateStructuredOutput(promptObj.content, schema);

    await AIUsage.create({
      userId,
      feature: 'daily_plan',
      totalTokens: 450,
      estimatedCostUSD: 0.0009
    });

    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/v1/ai/goal-breakdown
exports.breakdownGoal = async (req, res, next) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ success: false, message: 'Goal description is required' });

    const promptObj = promptManager.getPrompt('GOAL_BREAKDOWN', goal);
    const schema = { milestones: ["array"], weeklyRoadmap: ["array"], difficulty: 5, estimatedWeeks: 4 };

    const breakdown = await aiService.generateStructuredOutput(promptObj.content, schema);
    res.json({ success: true, data: breakdown });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/v1/ai/smart-priority
exports.smartPrioritize = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.userId, status: { $ne: 'done' } });
    const promptObj = promptManager.getPrompt('SMART_PRIORITY', tasks);
    const schema = { urgent: ["array"], important: ["array"], later: ["array"], delegate: ["array"] };

    const priorityMatrix = await aiService.generateStructuredOutput(promptObj.content, schema);
    res.json({ success: true, data: priorityMatrix });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/ai/coach/stream
exports.streamCoachResponse = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Query required' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const chunks = [
      "Based on your recent execution speed, ",
      "your top priority should be completing the core backend tasks ",
      "before moving to non-essential items. ",
      "You are 85% on track for your weekly target!"
    ];

    for (const chunk of chunks) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/ai/predictive-analytics
exports.getPredictiveAnalytics = async (req, res, next) => {
  try {
    const stats = await Statistics.findOne({ userId: req.userId });
    const completedTasks = stats ? stats.completedTasks : 0;

    res.json({
      success: true,
      data: {
        goalCompletionProbability: completedTasks > 10 ? '88%' : '65%',
        burnoutRisk: 'Low',
        productivityScore: Math.min(100, 70 + (stats ? stats.streak * 2 : 0)),
        upcomingBottlenecks: ['Context switching between multiple unassigned tasks']
      }
    });
  } catch (error) {
    next(error);
  }
};
