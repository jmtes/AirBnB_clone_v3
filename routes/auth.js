const express = require('express');

const router = express.Router();

// @route   GET /api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', async (req, res) => {
  res.send('GET logged in user');
});

// @route   POST /api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post('/', async (req, res) => {
  res.send('POST authenticate user and get token');
});

module.exports = router;
