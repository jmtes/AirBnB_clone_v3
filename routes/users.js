const express = require('express');

const router = express.Router();

// @route   GET /api/users/:id
// @desc    Get user info
// @access  Public
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  res.send(`GET user with id ${id}`);
});

// @route   POST /api/users
// @desc    Register new user
// @access  Public
router.post('/', async (req, res) => {
  res.send(`POST register new user`);
});

// @route   PUT /api/users/:id
// @desc    Edit user info
// @access  Private
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  res.send(`PUT Edit info for user ${id}`);
});

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Private
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  res.send(`DELETE user with id ${id}`);
});

module.exports = router;
