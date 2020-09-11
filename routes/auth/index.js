const express = require('express');
const { check } = require('express-validator');

const checkAuth = require('../middleware/checkAuth');
const validateRequest = require('../middleware/validateRequest');

const { getMe, loginUser } = require('./handlers');

const router = express.Router();

// @route   GET /api/auth
// @desc    Get logged-in user
// @access  Private
router.get('/', checkAuth, getMe);

// @route   POST /api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please provide a valid email.').isEmail().normalizeEmail(),
    check('password', 'Please provide a password.').isString(),
    validateRequest
  ],
  loginUser
);

module.exports = router;
