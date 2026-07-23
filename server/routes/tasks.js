const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTask, updateTask, deleteTask, completeTask,
  getTodayTasks, searchTasks, filterTasks, getAllTasks
} = require('../controllers/taskController');

router.get('/', auth, getAllTasks);
router.post('/', auth, createTask);
router.get('/today', auth, getTodayTasks);
router.get('/search', auth, searchTasks);
router.get('/filter', auth, filterTasks);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);
router.patch('/:id/complete', auth, completeTask);

module.exports = router;
