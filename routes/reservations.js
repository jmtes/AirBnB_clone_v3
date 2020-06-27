const express = require('express');

const router = express.Router();

// @route   GET /api/reservations/for/:placeID
// @desc    Get reservations for a place
// @access  Public
router.get('/for/:placeID', async (req, res) => {
  const placeID = req.params.placeID;
  res.send(`GET reservations for place with id ${placeID}`);
});

// @route   POST /api/reservations/for/:placeID
// @desc    Make reservation for place
// @access  Private
router.post('/for/:placeID', async (req, res) => {
  const placeID = req.params.placeID;
  res.send(`POST Make reservation for place with id ${placeID}`);
});

// @route   PUT /api/reservations/:id
// @desc    Edit reservation details
// @access  Private
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  res.send(`PUT Edit details for reservation with id ${id}`);
});

// @route   DELETE /api/reservation/:id
// @desc    Cancel reservation
// @access  Private
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  res.send(`DELETE Cancel reservation with id ${id}`);
});

module.exports = router;
