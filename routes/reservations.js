const express = require('express');
const { check, validationResult } = require('express-validator');

const authCheck = require('../middleware/authCheck');

const Place = require('../models/Place');
const Reservation = require('../models/Reservation');

const router = express.Router();

// @route   GET /api/reservations/for/:placeID
// @desc    Get reservations for a place
// @access  Public
router.get('/for/:placeID', async (req, res) => {
  const { placeID } = req.params;
  res.send(`GET reservations for place with id ${placeID}`);
});

// @route   POST /api/reservations/for/:placeID
// @desc    Make reservation for place
// @access  Private
router.post(
  '/for/:placeID',
  [
    authCheck,
    check('arrival', 'Please specify a valid date of arrival.').isISO8601(),
    check('checkout', 'Please specify a valid check-out date.').isISO8601()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { placeID } = req.params;

    try {
      const place = await Place.findById(placeID);

      if (!place) {
        res.status(404).json({ message: 'Place not found.' });
        return;
      }

      const newReservation = new Reservation({
        userID: req.user.id,
        placeID: place._id,
        ownerID: place.ownerID,
        arrival: new Date(arrival),
        checkout: new Date(checkout)
      });
    } catch (err) {
      console.log(err.message);
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
);

// @route   PUT /api/reservations/:id
// @desc    Edit reservation details
// @access  Private
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  res.send(`PUT Edit details for reservation with id ${id}`);
});

// @route   DELETE /api/reservation/:id
// @desc    Cancel reservation
// @access  Private
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  res.send(`DELETE Cancel reservation with id ${id}`);
});

module.exports = router;
