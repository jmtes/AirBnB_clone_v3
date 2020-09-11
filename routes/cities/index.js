const express = require('express');

const { getCities } = require('./handlers');

const router = express.Router();

// @route   GET api/cities
// @desc    Get all cities
// @access  Public
router.get('/', getCities);

module.exports = router;
