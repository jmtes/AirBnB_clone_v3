import express from 'express';
import { body, param } from 'express-validator';

import checkAuth from '../middleware/checkAuth';
import validateRequest from '../middleware/validateRequest';

import {
  getReservationsForPlace,
  getReservation,
  makeReservation,
  editReservation,
  cancelReservation
} from './handlers';

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

export default router;
