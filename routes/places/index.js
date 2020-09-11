const express = require('express');
const { body, param } = require('express-validator');

const checkAuth = require('../middleware/checkAuth');
const validateRequest = require('../middleware/validateRequest');

const {
  getPlacesInCity,
  getPlace,
  createPlace,
  editPlace,
  removePlace
} = require('./handlers');

const router = express.Router();

// @route   GET /api/places/in/:cityID
// @desc    Get all places in city
// @access  Public
router.get(
  '/in/:cityID',
  [
    param('cityID', 'Please provide a valid city ID.').isMongoId(),
    validateRequest
  ],
  getPlacesInCity
);

// @route   GET /api/places/:id
// @desc    Get a place
// @access  Public
router.get(
  '/:id',
  [
    param('id', 'Please provide a valid place ID.').isMongoId(),
    validateRequest
  ],
  getPlace
);

// @route   POST /api/places
// @desc    Add place to database
// @access  Private
router.post(
  '/',
  [
    checkAuth,
    body('name', 'Please provide a name for your place.')
      .isString()
      .escape()
      .trim()
      .isLength({ min: 1, max: 32 }),
    body('desc', 'Please provide a description for your place.')
      .isString()
      .escape()
      .trim()
      .isLength({ min: 1, max: 1000 }),
    body('address', 'Please provide an address for your place.').isString(),
    body('beds', 'Please provide the number of beds.').isInt(),
    body('baths', 'Please provide the number of baths.').isInt(),
    body(
      'price',
      'Please provide the price per night for your place.'
    ).isNumeric(),
    body('maxGuests', 'Please provide a number for maximum guests.')
      .optional()
      .isInt(),
    body('amenities', 'Please provide an array of amenities.')
      .optional()
      .isArray(),
    body('photos', 'Please provide an array of photo URLS.')
      .optional()
      .isArray(),
    validateRequest
  ],
  createPlace
);

// @route   PUT api/places/:id
// @desc    Edit place details
// @access  Private
router.put(
  '/:id',
  [
    checkAuth,
    param('id', 'Please provide a valid place ID.').isMongoId(),
    body('name', 'Please provide a valid name.')
      .optional()
      .isString()
      .escape()
      .trim()
      .isLength({ min: 1, max: 32 }),
    body('desc', 'Please provide a valid description.')
      .optional()
      .isString()
      .escape()
      .trim()
      .isLength({ min: 1, max: 1000 }),
    body('address', 'Cannot change address of a place.').not().exists(),
    body('beds', 'Please provide a valid number of beds.').optional().isInt(),
    body('baths', 'Please provide a valid number of baths.').optional().isInt(),
    body('price', 'Please provide a valid price per night.')
      .optional()
      .isNumeric(),
    body('maxGuests', 'Please provide a valid number for maximum guests.')
      .optional()
      .isInt(),
    body('amenities', 'Please provide an array of amenities.')
      .optional()
      .isArray(),
    body('photos', 'Please provide an array of photo URLS.')
      .optional()
      .isArray(),
    body('_id', 'Cannot change the ID of a place.').not().exists(),
    body('ownerID', 'Cannot change the owner of a place.').not().exists(),
    body('cityID', 'Cannot change the city of a place.').not().exists(),
    body('latitude', 'Cannot change the coordinates of a place.')
      .not()
      .exists(),
    body('longitude', 'Cannot change the coordinates of a place.')
      .not()
      .exists(),
    validateRequest
  ],
  editPlace
);

// @route   DELETE api/places/:id
// @desc    Remove place from database
// @access  Private
router.delete(
  '/:id',
  [
    checkAuth,
    param('id', 'Please provide a valid place ID.').isMongoId(),
    validateRequest
  ],
  removePlace
);

module.exports = router;
