const express = require('express');
const { check, validationResult } = require('express-validator');
const axios = require('axios');

const authCheck = require('../middleware/authCheck');
const keys = require('../config/keys');

const City = require('../models/City');
const Place = require('../models/Place');

const createCity = require('./utils/createCity');

const router = express.Router();

// @route   GET /api/places/in/:cityID
// @desc    Get all places in city
// @access  Public
router.get('/in/:cityID', async (req, res) => {
  const { cityID } = req.params;
  res.send(`GET all places in city with id ${cityID}`);
});

// @route   GET /api/places/:id
// @desc    Get a place
// @access  Public
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  res.send(`GET place with id ${id}`);
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

    try {
      // Validate address with Location IQ
      const locRes = await axios.get(
        'https://us1.locationiq.com/v1/search.php',
        {
          params: {
            q: req.body.address,
            format: 'json',
            addressdetails: 1,
            limit: 1,
            key: keys.locationIQAPIKey
          }
        }
      );

      const locData = locRes.data[0];

      // Make sure place is residential
      if (locData.class !== 'place' || locData.type !== 'house') {
        res
          .status(400)
          .json({ message: 'Please provide a valid residential address.' });
        return;
      }

      // Check if city exists
      let city = await City.findOne({
        name: locData.address.city,
        state: locData.address.state || '',
        region: locData.address.region || '',
        country: locData.address.country
      });

      if (!city) {
        city = await createCity(
          locData.address.city,
          locData.address.state,
          locData.address.region,
          locData.address.country
        );
      }

      const newPlace = new Place({
        name: req.body.name,
        desc: req.body.desc,
        ownerID: req.user.id,
        cityID: city._id,
        address: `${locData.address.house_number} ${locData.address.road}`,
        latitude: locData.lat,
        longitude: locData.lon,
        beds: req.body.beds,
        baths: req.body.baths,
        price: req.body.price,
        maxGuests: req.body.maxGuests,
        amenities: req.body.amenities,
        photos: req.body.photos
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
