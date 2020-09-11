const express = require('express');
const { body, param } = require('express-validator');

const checkAuth = require('../middleware/checkAuth');
const validateRequest = require('../middleware/validateRequest');

const {
  getReservationsForPlace,
  getReservation,
  makeReservation,
  editReservation,
  cancelReservation
} = require('./handlers');

const Reservation = require('../../models/Reservation');

const router = express.Router();

// @route   GET /api/reservations/for/:placeID
// @desc    Get reservations for a place
// @access  Private
router.get(
  '/for/:placeID',
  [
    checkAuth,
    param('placeID', 'Please provide a valid place ID.').isMongoId(),
    validateRequest
  ],
  getReservationsForPlace
);

// @route   GET /api/reservations/:id
// @desc    Get reservation
// @access  Private
router.get(
  '/:id',
  [
    checkAuth,
    param('id', 'Please provide a valid reservation ID.').isMongoId(),
    validateRequest
  ],
  getReservation
);

// @route   POST /api/reservations/for/:placeID
// @desc    Make reservation for place
// @access  Private
router.post(
  '/for/:placeID',
  [
    checkAuth,
    param('placeID', 'Please provide a valid place ID.').isMongoId(),
    body('checkin', 'Please specify a valid check-in date.').isISO8601(),
    body('checkout', 'Please specify a valid check-out date.').isISO8601(),
    validateRequest
  ],
  makeReservation
);

// @route   PUT /api/reservations/confirm/:id
// @desc    Confirm reservation
// @access  Private
router.put('/confirm/:id', checkAuth, async (req, res) => {
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
    checkAuth,
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
      .exists(),
    validateRequest
  ],
  editReservation
);

// @route   DELETE /api/reservation/:id
// @desc    Cancel reservation
// @access  Private
router.delete(
  '/:id',
  [
    checkAuth,
    param('id', 'Please provide a valid reservation ID.').isMongoId(),
    validateRequest
  ],
  cancelReservation
);

module.exports = router;
