const express = require('express');

const router = express.Router();

// @route   GET api/cities
// @desc    Get all cities
// @access  Public
router.get('/', async (req, res) => {
  res.send('GET all cities');
});

// @route   GET api/cities/:id
// @desc    Get one city
// @access  Public
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  res.send(`GET city with ID ${id}`);
});

// @route   GET /api/cities/search/:q
// @desc    Search cities
// @access  Public
router.get('/search/:q', async (req, res) => {
  const q = req.params.q;
  res.send(`GET cities matching ${q}`);
});

// @route   POST /api/cities
// @desc    Add city to database
// @access  Private
router.post('/', async (req, res) => {
  res.send('POST new city');
});

module.exports = router;
