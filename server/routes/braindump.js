const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllNotes, createNote, convertToTask, deleteNote } = require('../controllers/braindumpController');

router.get('/', auth, getAllNotes);
router.post('/', auth, createNote);
router.post('/:id/convert', auth, convertToTask);
router.delete('/:id', auth, deleteNote);

module.exports = router;
