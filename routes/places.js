const express = require('express');
const { check, validationResult } = require('express-validator');

const authCheck = require('../middleware/authCheck');

const City = require('../models/City');
const Place = require('../models/Place');
const User = require('../models/User');

const createCity = require('./utils/createCity');
const validateAddress = require('./utils/validateAddress');

const router = express.Router();

// @route   GET /api/places/in/:cityID
// @desc    Get all places in city
// @access  Public
router.get('/in/:cityID', async (req, res) => {
  const { cityID } = req.params;

  try {
    const places = await Place.find({ cityID }, { __v: 0 });

    res.json({ places });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
});

// @route   GET /api/places/:id
// @desc    Get a place
// @access  Public
router.get('/:id', async (req, res) => {
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
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
});

// @route   POST /api/places
// @desc    Add place to database
// @access  Private
router.post(
  '/',
  [
    authCheck,
    check('name', 'Please provide a name for your place.').isString(),
    check('desc', 'Please provide a description for your place.').isString(),
    check('address', 'Please provide an address for your place.').isString(),
    check('beds', 'Please provide the number of beds.').isInt(),
    check('baths', 'Please provide the number of baths.').isInt(),
    check(
      'price',
      'Please provide the price per night for your place.'
    ).isNumeric(),
    check('maxGuests', 'Please provide a number for maximum guests.')
      .optional()
      .isInt(),
    check('amenities', 'Please provide an array of amenities.')
      .optional()
      .isArray(),
    check('photos', 'Please provide an array of photo URLS.')
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

      await User.findByIdAndUpdate(req.user.id, {
        $push: { places: place._id }
      });

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
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  res.send(`PUT edit details of place ${id}`);
});

// @route   DELETE api/places/:id
// @desc    Remove place from database
// @access  Private
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.send(`DELETE place with id ${id}`);
});

module.exports = router;
