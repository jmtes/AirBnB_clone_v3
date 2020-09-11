const express = require('express');
const { body, param } = require('express-validator');

const checkAuth = require('../middleware/checkAuth');
const validateRequest = require('../middleware/validateRequest');

const {
  getUser,
  registerUser,
  editUser,
  deactivateUser
} = require('./handlers');

const router = express.Router();

// @route   GET /api/users/:id
// @desc    Get user info
// @access  Public
router.get(
  '/:id',
  [param('id', 'Please provide a valid user ID.').isMongoId(), validateRequest],
  getUser
);

// @route   POST /api/users
// @desc    Register new user
// @access  Public
router.post(
  '/',
  [
    body('name', 'Please provide a name.')
      .isString()
      .escape()
      .trim()
      .isLength({ min: 1, max: 32 }),
    body('email', 'Please provide a valid email.').isEmail().normalizeEmail(),
    body('password', 'Please enter a password with 8 or more characters.')
      .isString()
      .isLength({ min: 8 }),
    validateRequest
  ],
  registerUser
);

// @route   PUT /api/users
// @desc    Edit user info
// @access  Private
router.put(
  '/',
  [
    checkAuth,
    body('name', 'Please provide a name that is 32 characters or less.')
      .optional()
      .isString()
      .escape()
      .trim()
      .isLength({ min: 1, max: 32 }),
    body('bio', 'Please provide a bio that is 200 characters or less.')
      .optional()
      .isString()
      .escape()
      .trim()
      .isLength({ max: 200 }),
    body('avatar', 'Please provide a valid image URL.').optional().isURL(),
    body('email', 'Please provide a valid email.')
      .optional()
      .isEmail()
      .normalizeEmail(),
    body('newPassword', 'Please enter a password with 8 or more characters.')
      .optional()
      .isString()
      .isLength({ min: 8 }),
    body('_id', 'Cannot change the ID of a user.').not().exists(),
    body('places', 'Cannot modify user listings.').not().exists(),
    body('reservations', 'Cannot modify user reservations.').not().exists(),
    body('reviews', 'Cannot modify user reviews.').not().exists(),
    validateRequest
  ],
  editUser
);

// @route   POST /api/users/deactivate
// @desc    Delete user account
// @access  Private
router.post(
  '/deactivate',
  [
    checkAuth,
    body('password', 'Password required for deactivation.').isString(),
    validateRequest
  ],
  deactivateUser
);

module.exports = router;
