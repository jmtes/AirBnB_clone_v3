const express = require('express');

const router = express.Router();

// @route   GET /api/places/:id
// @desc    Get a place
// @access  Public
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  res.send(`GET place with id ${id}`);
});

// @route   POST /api/places
// @desc    Add place to database
// @access  Private
router.post('/', async (req, res) => {
  res.send(`POST place`);
});

// @route   PUT api/places/:id
// @desc    Edit place details
// @access  Private
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  res.send(`PUT edit details of place ${id}`);
});

// @route   DELETE api/places/:id
// @desc    Remove place from database
// @access  Private
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  res.send(`DELETE place with id ${id}`);
});

module.exports = router;
