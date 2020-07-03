const express = require('express');

const City = require('../models/City');

const router = express.Router();

// @route   GET api/cities
// @desc    Get all cities
// @access  Public
router.get('/', async (req, res) => {
  console.log(req.query);
  res.send('GET all cities');
});

// @route   GET api/cities/:id
// @desc    Get one city
// @access  Public
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  res.send(`GET city with ID ${id}`);
});

// @route   GET /api/cities/search/:q
// @desc    Search cities
// @access  Public
router.get('/search/:q', async (req, res) => {
  const { q } = req.params;
  res.send(`GET cities matching ${q}`);
});

module.exports = router;
