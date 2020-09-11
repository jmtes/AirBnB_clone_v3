const express = require('express');
const { body, param } = require('express-validator');

const authCheck = require('../middleware/authCheck');
const requestIsValid = require('./utils/requestIsValid');

const Place = require('../models/Place');
const Reservation = require('../models/Reservation');

const router = express.Router();

// @route   GET /api/reservations/for/:placeID
// @desc    Get reservations for a place
// @access  Private
router.get(
  '/for/:placeID',
  [authCheck, param('placeID', 'Please provide a valid place ID.').isMongoId()],
  async (req, res) => {
    if (!requestIsValid(req, res)) return;

    const { placeID } = req.params;

    try {
      const place = await Place.findById(placeID);

      if (!place) {
        res.status(404).json({ message: 'Place not found.' });
        return;
      }

      if (place.ownerID !== req.user.id) {
        res.status(403).json({ message: 'Invalid credentials.' });
        return;
      }

      const reservations = await Reservation.find({ placeID });

      res.json({ reservations });
    } catch (err) {
      console.log(err.message);
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
);

// @route   GET /api/reservations/:id
// @desc    Get reservation
// @access  Private
router.get(
  '/:id',
  [
    authCheck,
    param('id', 'Please provide a valid reservation ID.').isMongoId()
  ],
  async (req, res) => {
    if (!requestIsValid(req, res)) return;

    const { id } = req.params;

    try {
      const reservation = await Reservation.findById(id);

      if (!reservation) {
        res.status(404).json({ message: 'Reservation not found.' });
        return;
      }

      if (
        !(
          reservation.userID === req.user.id ||
          reservation.ownerID === req.user.id
        )
      ) {
        res.status(403).json({ message: 'Invalid credentials.' });
        return;
      }

      res.json(reservation);
    } catch (err) {
      console.log(err.message);
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
);

// @route   POST /api/reservations/for/:placeID
// @desc    Make reservation for place
// @access  Private
router.post(
  '/for/:placeID',
  [
    authCheck,
    param('placeID', 'Please provide a valid place ID.').isMongoId(),
    body('checkin', 'Please specify a valid check-in date.').isISO8601(),
    body('checkout', 'Please specify a valid check-out date.').isISO8601()
  ],
  async (req, res) => {
    if (!requestIsValid(req, res)) return;

    const { placeID } = req.params;

    try {
      const existingReservation = await Reservation.findOne({
        userID: req.user.id,
        placeID
      });

      if (existingReservation) {
        res
          .status(403)
          .json({ message: 'You already have a reservation for this place.' });
        return;
      }

      const place = await Place.findById(placeID);

      if (!place) {
        res.status(404).json({ message: 'Place not found.' });
        return;
      }

      if (place.ownerID === req.user.id) {
        res.status(403).json({
          message: 'You cannot make a reservation for your own place.'
        });
        return;
      }

      let { checkin, checkout } = req.body;

      checkin = new Date(checkin);
      checkout = new Date(checkout);

      const newReservation = new Reservation({
        userID: req.user.id,
        placeID: place._id,
        ownerID: place.ownerID,
        checkin,
        checkout
      });

      const reservation = await newReservation.save();

      res.json(reservation);
    } catch (err) {
      console.log(err.message);
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
);

// @route   PUT /api/reservations/confirm/:id
// @desc    Confirm reservation
// @access  Private
router.put('/confirm/:id', authCheck, async (req, res) => {
  const { id } = req.params;

  try {
    let reservation = await Reservation.findById(id);

    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found.' });
      return;
    }

    if (reservation.ownerID !== req.user.id) {
      res.status(403).json({ message: 'Invalid credentials.' });
      return;
    }

    reservation = await Reservation.findByIdAndUpdate(
      id,
      { $set: { confirmed: true } },
      { new: true, fields: { __v: 0 } }
    );

    res.json(reservation);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
});

// @route   PUT /api/reservations/:id
// @desc    Edit reservation details
// @access  Private
router.put(
  '/:id',
  [
    authCheck,
    param('id', 'Please provide a valid reservation ID.').isMongoId(),
    body('checkin', 'Please specify a valid check-in date.')
      .optional()
      .isISO8601(),
    body('checkout', 'Please specify a valid check-out date.')
      .optional()
      .isISO8601(),
    body('_id', 'Cannot change the ID of a reservation.').not().exists(),
    body('userID', 'Cannot edit the user associated with a reservation.')
      .not()
      .exists(),
    body('placeID', 'Cannot change the place for a reservation.')
      .not()
      .exists(),
    body('ownerID', 'Cannot change the owner of the place for a reservation.')
      .not()
      .exists(),
    body('confirmed', 'Cannot change the confirmation status of a reservation.')
      .not()
      .exists()
  ],
  async (req, res) => {
    if (!requestIsValid(req, res)) return;

    const { id } = req.params;

    try {
      let reservation = await Reservation.findById(id);

      if (!reservation) {
        res.status(404).json({ message: 'Reservation not found.' });
        return;
      }

      if (reservation.userID !== req.user.id) {
        res.status(403).json({ message: 'Invalid credentials.' });
        return;
      }

      if (reservation.confirmed) {
        res.status(403).json({
          message:
            'Cannot edit a confirmed reservation. Please cancel your the reservation and make a new one.'
        });
        return;
      }

      if (req.body.checkin) req.body.checkin = new Date(req.body.checkin);
      if (req.body.checkout) req.body.checkout = new Date(req.body.checkout);

      reservation = await Reservation.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, fields: { __v: 0 } }
      );

      res.json(reservation);
    } catch (err) {
      console.log(err.message);
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
);

// @route   DELETE /api/reservation/:id
// @desc    Cancel reservation
// @access  Private
router.delete(
  '/:id',
  [
    authCheck,
    param('id', 'Please provide a valid reservation ID.').isMongoId()
  ],
  async (req, res) => {
    if (!requestIsValid(req, res)) return;

    const { id } = req.params;

    try {
      let reservation = await Reservation.findById(id);

      if (!reservation) {
        res.status(404).json({ message: 'Reservation not found.' });
        return;
      }

      if (reservation.userID !== req.user.id) {
        res.status(403).json({ message: 'Invalid credentials.' });
        return;
      }

      reservation = await Reservation.findByIdAndRemove(id);

      res.json({ message: 'Successfully cancelled reservation.' });
    } catch (err) {
      console.log(err.message);
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
);

module.exports = router;
