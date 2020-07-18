const express = require('express');
const { check, validationResult } = require('express-validator');

const authCheck = require('../middleware/authCheck');

const Place = require('../models/Place');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/reservations/for/:placeID
// @desc    Get reservations for a place
// @access  Private
router.get('/for/:placeID', authCheck, async (req, res) => {
  const { placeID } = req.params;

  try {
    const place = await Place.findById(placeID);

    if (!place) {
      res.status(404).json({ message: 'Place not found.' });
      return;
    }

    if (place.ownerID !== req.user.id) {
      res.status(403).json({ message: 'Access forbidden.' });
      return;
    }

    const reservations = await Reservation.find({ placeID });

    res.json({ reservations });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
});

// @route   GET /api/reservations/:id
// @desc    Get reservation
// @access  Private
router.get('/:id', authCheck, async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      res.status(404).json({ message: 'No reservation found.' });
      return;
    }

    if (
      !(
        reservation.userID === req.user.id ||
        reservation.ownerID === req.user.id
      )
    ) {
      res.status(403).json({ message: 'Access forbidden.' });
      return;
    }

    res.json(reservation);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
});

// @route   POST /api/reservations/for/:placeID
// @desc    Make reservation for place
// @access  Private
router.post(
  '/for/:placeID',
  [
    authCheck,
    check('checkin', 'Please specify a valid check-in date.').isISO8601(),
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
      const user = await User.findById(req.user.id);

      if (user.reservations.length >= 2) {
        res.status(403).json({
          message: 'Users can have a maximum of two active reservations.'
        });
        return;
      }

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

      const { checkin, checkout } = req.body;

      const newReservation = new Reservation({
        userID: req.user.id,
        placeID: place._id,
        ownerID: place.ownerID,
        checkin,
        checkout
      });

      const reservation = await newReservation.save();

      await User.findByIdAndUpdate(req.user.id, {
        $push: { reservations: reservation }
      });

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
      res.status(404).json({ message: 'No reservation found.' });
      return;
    }

    if (reservation.ownerID !== req.user.id) {
      res.status(403).json({ message: 'Access forbidden.' });
      return;
    }

    reservation = await Reservation.findByIdAndUpdate(
      id,
      { $set: { confirmed: true } },
      { new: true, fields: { __v: 0 } }
    );

    await User.updateOne(
      {
        _id: reservation.userID,
        'reservations._id': reservation._id
      },
      { $set: { 'reservations.$.confirmed': true } }
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
    check('checkin', 'Please specify a valid check-in date.')
      .optional()
      .isISO8601(),
    check('checkout', 'Please specify a valid check-out date.')
      .optional()
      .isISO8601(),
    check('_id', 'Cannot change the ID of a reservation.').not().exists(),
    check('userID', 'Cannot edit the user associated with a reservation.')
      .not()
      .exists(),
    check('placeID', 'Cannot change the place for a reservation.')
      .not()
      .exists(),
    check('ownerID', 'Cannot change the owner of the place for a reservation.')
      .not()
      .exists(),
    check(
      'confirmed',
      'Cannot change the confirmation status of a reservation.'
    )
      .not()
      .exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;

    try {
      let reservation = await Reservation.findById(id);

      if (!reservation) {
        res.status(404).json({ message: 'No reservation found.' });
        return;
      }

      if (reservation.userID !== req.user.id) {
        res.status(403).json({ message: 'Access forbidden.' });
        return;
      }

      if (reservation.confirmed) {
        res.status(403).json({
          message:
            'Cannot edit a confirmed reservation. Please cancel your the reservation and make a new one.'
        });
        return;
      }

      reservation = await Reservation.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, fields: { __v: 0 } }
      );

      await User.updateOne(
        {
          _id: reservation.userID,
          'reservations._id': reservation._id
        },
        { $set: { 'reservations.$': reservation } }
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
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  res.send(`DELETE Cancel reservation with id ${id}`);
});

module.exports = router;
