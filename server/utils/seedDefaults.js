const Project = require('../models/Project');
const Statistics = require('../models/Statistics');

const DEFAULT_PROJECTS = [
  { name: 'Placement', color: '#6366f1', isDefault: true },  // indigo
  { name: 'Backend', color: '#8b5cf6', isDefault: true },    // violet
  { name: 'DSA', color: '#06b6d4', isDefault: true },        // cyan
  { name: 'AI', color: '#10b981', isDefault: true },          // emerald
  { name: 'College', color: '#f59e0b', isDefault: true },     // amber
  { name: 'YouTube', color: '#ef4444', isDefault: true }      // red
];

const seedDefaults = async (userId) => {
  try {
    // Create default projects
    const projectDocs = DEFAULT_PROJECTS.map(p => ({
      ...p,
      userId
    }));
    await Project.insertMany(projectDocs, { ordered: false }).catch(() => {
      // Ignore duplicate errors if user already has defaults
    });

    // Initialize statistics
    await Statistics.findOneAndUpdate(
      { userId },
      { userId },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error seeding defaults:', error.message);
  }
};

module.exports = seedDefaults;
