const express = require('express');

const City = require('../models/City');

const router = express.Router();

// @route   GET api/cities
// @desc    Get all cities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const cities = await City.find({}, { __v: 0 });

    res.json({ cities });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
});

module.exports = router;
