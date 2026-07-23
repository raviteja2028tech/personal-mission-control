const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllProjects, createProject, updateProject, deleteProject, getProjectStats
} = require('../controllers/projectController');

router.get('/', auth, getAllProjects);
router.post('/', auth, createProject);
router.put('/:id', auth, updateProject);
router.delete('/:id', auth, deleteProject);
router.get('/:id/stats', auth, getProjectStats);

module.exports = router;
