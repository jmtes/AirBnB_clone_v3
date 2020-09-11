const express = require('express');
const { check } = require('express-validator');

const authCheck = require('../../middleware/authCheck');

const { getMe, loginUser } = require('./handlers');

const router = express.Router();

// @route   GET /api/auth
// @desc    Get logged-in user
// @access  Private
router.get('/', authCheck, getMe);

// @route   POST /api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please provide a valid email.').isEmail().normalizeEmail(),
    check('password', 'Please provide a password.').isString()
  ],
  loginUser
);

module.exports = router;
