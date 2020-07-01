const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');

const keys = require('../config/keys');

const router = express.Router();

// @route   GET /api/users/:id
// @desc    Get user info
// @access  Public
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id, {
      name: 1,
      avatar: 1,
      places: 1
    });

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
    } else {
      res.json(user);
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
});

// @route   POST /api/users
// @desc    Register new user
// @access  Public
router.post(
  '/',
  [
    check('name', 'Please provide a name.').not().isEmpty(),
    check('email', 'Please provide a valid email.').isEmail(),
    check(
      'password',
      'Please enter a password with 8 or more characters.'
    ).isLength({ min: 8 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, email, password } = req.body;

    let user;

    try {
      user = await User.findOne({ email });

      if (user) {
        res
          .status(409)
          .json({ message: 'An account with that email already exists.' });
        return;
      }

      user = new User({
        name,
        email
      });

      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(password, salt);

      await user.save();

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

// @route   PUT /api/users/:id
// @desc    Edit user info
// @access  Private
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  res.send(`PUT Edit info for user ${id}`);
});

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Private
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  res.send(`DELETE user with id ${id}`);
});

module.exports = router;
