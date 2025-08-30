const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { auth } = require('../middlewares/auth');

// GET /api/tasks - fetch all tasks for the logged-in user, populate patient info
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id })
      .populate('patientId', 'firstName lastName email');
    res.status(200).json({ success: true, data: { tasks } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tasks', error: error.message });
  }
});

// POST /api/tasks - create a new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, date, patientId } = req.body;
    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Title and date are required' });
    }
    const newTask = new Task({
      title,
      date,
      createdBy: req.user.id,
      patientId: patientId || undefined
    });
    await newTask.save();
    // Populate patient info for response
    await newTask.populate('patientId', 'firstName lastName email');
    res.status(201).json({ success: true, data: { task: newTask } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create task', error: error.message });
  }
});

module.exports = router;
