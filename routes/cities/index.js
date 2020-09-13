const express = require('express');
const { param } = require('express-validator');

const validateRequest = require('../middleware/validateRequest');

const { getCity, getCities } = require('./handlers');

const router = express.Router();

// @route   GET api/cities/:id
// @desc    Get one city
// @access  Public
router.get(
  '/:id',
  [param('id', 'Please provide a valid city ID.').isMongoId(), validateRequest],
  getCity
);

// @route   GET api/cities
// @desc    Get all cities
// @access  Public
router.get('/', getCities);

module.exports = router;
