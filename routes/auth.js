const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');

const keys = require('../config/keys');

const router = express.Router();

// @route   GET /api/auth
// @desc    Get logged-in user
// @access  Private
router.get('/', async (req, res) => {
  res.send('GET logged in user');
});

// @route   POST /api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please provide a valid email.').isEmail(),
    check('password', 'Please provide a password.').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const isCorrectPassword = await bcrypt.compare(password, user.password);

      if (!isCorrectPassword) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(payload, keys.jwtSecret, { expiresIn: 240000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.log(err.message);
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
);

module.exports = router;
