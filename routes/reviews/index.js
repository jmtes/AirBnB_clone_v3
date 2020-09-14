import express from 'express';
import { body, param } from 'express-validator';

import checkAuth from '../middleware/checkAuth';
import validateRequest from '../middleware/validateRequest';

import { getReview, postReview, editReview, deleteReview } from './handlers';

const router = express.Router();

// @route   GET /api/reviews/:id
// @desc    Get review
// @access  Public
router.get(
  '/:id',
  [
    param('id', 'Please provide a valid review ID.').isMongoId(),
    validateRequest
  ],
  getReview
);

// @route   POST /api/reviews/for/:placeID
// @desc    Post review for place
// @access  Private
router.post(
  '/for/:placeID',
  [
    checkAuth,
    param('placeID', 'Please provide a valid place ID.').isMongoId(),
    body('userName', 'Please provide a valid user name.')
      .optional()
      .isString()
      .escape()
      .trim()
      .isLength({ max: 32 }),
    body('stars', 'Please provide a valid rating.').isInt({ min: 1, max: 5 }),
    body('title', 'Please provide a title that is 32 characters or less.')
      .isString()
      .escape()
      .trim()
      .isLength({ min: 1, max: 32 }),
    body('body', 'Please provide a body that is 1000 characters or less.')
      .isString()
      .escape()
      .trim()
      .isLength({ min: 1, max: 1000 }),
    validateRequest
  ],
  postReview
);

// @route   PUT /api/reviews/:id
// @desc    Edit review
// @access  Private
router.put(
  '/:id',
  [
    checkAuth,
    param('id', 'Please provide a valid review ID.').isMongoId(),
    body('stars', 'Please provide a valid rating.')
      .optional()
      .isInt({ min: 1, max: 5 }),
    body('title', 'Please provide a title that is 32 characters or less.')
      .optional()
      .isString()
      .escape()
      .trim()
      .isLength({ min: 1, max: 32 }),
    body('body', 'Please provide a body that is 1000 characters or less.')
      .optional()
      .isString()
      .escape()
      .trim()
      .isLength({ min: 1, max: 1000 }),
    body('userName', 'Cannot change username.').not().exists(),
    body('date', 'Cannot change the date of a review.').not().exists(),
    body('_id', 'Cannot change the ID of a review.').not().exists(),
    body('userID', 'Cannot change the user attributed to a review.')
      .not()
      .exists(),
    body('placeID', 'Cannot change the place a review is for.').not().exists(),
    validateRequest
  ],
  editReview
);

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete(
  '/:id',
  [
    checkAuth,
    param('id', 'Please provide a valid review ID.').isMongoId(),
    validateRequest
  ],
  deleteReview
);

export default router;
