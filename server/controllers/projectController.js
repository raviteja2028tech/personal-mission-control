const Project = require('../models/Project');
const Task = require('../models/Task');

// @route   GET /api/projects
exports.getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.userId }).sort({ isDefault: -1, createdAt: 1 });

    // Compute stats for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ userId: req.userId, projectId: project._id });
        const completedTasks = await Task.countDocuments({ userId: req.userId, projectId: project._id, status: 'done' });
        const pendingTasks = totalTasks - completedTasks;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
          pendingTasks,
          progress
        };
      })
    );

    res.json({ success: true, projects: projectsWithStats });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/projects
exports.createProject = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const project = await Project.create({ userId: req.userId, name, color });
    res.status(201).json({ success: true, project: { ...project.toObject(), totalTasks: 0, completedTasks: 0, pendingTasks: 0, progress: 0 } });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/projects/:id
exports.updateProject = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, color },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/projects/:id
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.userId });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Unassign tasks from this project (don't delete them)
    await Task.updateMany(
      { userId: req.userId, projectId: project._id },
      { projectId: null }
    );

    await Project.deleteOne({ _id: project._id });

    res.json({ success: true, message: 'Project deleted, tasks unassigned' });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/projects/:id/stats
exports.getProjectStats = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const totalTasks = await Task.countDocuments({ userId: req.userId, projectId: project._id });
    const completedTasks = await Task.countDocuments({ userId: req.userId, projectId: project._id, status: 'done' });
    const pendingTasks = totalTasks - completedTasks;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const tasksByPriority = await Task.aggregate([
      { $match: { userId: req.userId, projectId: project._id } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        project: project.toObject(),
        totalTasks,
        completedTasks,
        pendingTasks,
        progress,
        tasksByPriority
      }
    });
  } catch (error) {
    next(error);
  }
};
