const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users - fetch all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: { users } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});

module.exports = router;
