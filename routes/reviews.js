const express = require('express');

const router = express.Router();

// @route   GET /api/reviews/:placeID
// @desc    Get reviews for a place
// @access  Public
router.get('/:placeID', async (req, res) => {
  const placeID = req.params.placeID;
  res.send(`GET reviews for place with id ${placeID}`);
});

// @route   POST /api/reviews/:placeID
// @desc    Post review for place
// @access  Private
router.post('/:placeID', async (req, res) => {
  const placeID = req.params.placeID;
  res.send(`POST review for place with id ${placeID}`);
});

// @route   PUT /api/reviews/:id
// @desc    Edit review
// @access  Private
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  res.send(`PUT Edit review with id ${id}`);
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  res.send(`DELETE review`);
});

module.exports = router;
