const express = require('express');
const { body, param, validationResult } = require('express-validator');

const authCheck = require('../middleware/authCheck');

const City = require('../models/City');
const Place = require('../models/Place');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');

const createCity = require('./utils/createCity');
const validateAddress = require('./utils/validateAddress');

const router = express.Router();

// @route   GET /api/places/in/:cityID
// @desc    Get all places in city
// @access  Public
router.get(
  '/in/:cityID',
  param('cityID', 'Please provide a valid city ID.').isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { cityID } = req.params;

    try {
      const places = await Place.find({ cityID }, { __v: 0 });

      res.json({ places });
    } catch (err) {
      console.log(err.message);
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
);

// @route   GET /api/places/:id
// @desc    Get a place
// @access  Public
router.get(
  '/:id',
  param('id', 'Please provide a valid place ID.').isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;

    try {
      const place = await Place.findById(id);

      if (!place) {
        res.status(404).json({ message: `No place found with ID ${id}.` });
        return;
      }

      res.json({ place });
    } catch (err) {
      console.log(err.message);
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
);

// @route   POST /api/places
// @desc    Add place to database
// @access  Private
router.post(
  '/',
  [
    authCheck,
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
      .isArray()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      name,
      desc,
      address,
      beds,
      baths,
      price,
      maxGuests,
      amenities,
      photos
    } = req.body;

    try {
      // Validate address
      const locData = await validateAddress(address);

      const { lat, lon } = locData;
      const { road, state, region, country } = locData.address;

      // Check if city exists
      let city = await City.findOne({
        name: locData.address.city,
        state: state || '',
        region: region || '',
        country
      });

      if (!city) {
        city = await createCity(locData.address.city, state, region, country);
      }

      const newPlace = new Place({
        name,
        desc,
        ownerID: req.user.id,
        cityID: city._id,
        address: `${locData.address.house_number} ${road}`,
        latitude: lat,
        longitude: lon,
        beds,
        baths,
        price,
        maxGuests,
        amenities,
        photos
      });

      const place = await newPlace.save();

      res.json(place);
    } catch (err) {
      console.log(err.message);
      if (err.message === 'Request failed with status code 404') {
        res.status(400).json({
          message:
            'Could not validate address. Please check to make sure address is correct.'
        });
      } else if (err.message === 'Not a valid street address') {
        res.status(400).json({
          message: 'Please make sure your address contains a street address.'
        });
      } else {
        res
          .status(500)
          .json({ message: 'Something went wrong. Try again later.' });
      }
    }
  }
);

// @route   PUT api/places/:id
// @desc    Edit place details
// @access  Private
router.put(
  '/:id',
  [
    authCheck,
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
      let place = await Place.findById(id);

      if (!place) {
        res.status(404).json({ message: `No place found with ID ${id}` });
        return;
      }

      if (place.ownerID !== req.user.id) {
        res.status(403).json({ message: 'Access forbidden.' });
        return;
      }

      place = await Place.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, fields: { __v: 0 } }
      );

      res.json(place);
    } catch (err) {
      console.log(err.message);
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
);

// @route   DELETE api/places/:id
// @desc    Remove place from database
// @access  Private
router.delete(
  '/:id',
  [authCheck, param('id', 'Please provide a valid place ID.').isMongoId()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;

    try {
      let place = await Place.findById(id);

      if (!place) {
        res.status(404).json({ message: `No place found with ID ${id}.` });
        return;
      }

      if (place.ownerID !== req.user.id) {
        res.status(403).json({ message: 'Access forbidden.' });
        return;
      }

      place = await Place.findByIdAndRemove(id);

      await Reservation.deleteMany({ placeID: id });
      await Review.deleteMany({ placeID: id });

      res.json({ message: 'Successfully removed listing.' });
    } catch (err) {
      console.log(err.message);
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
);

module.exports = router;
