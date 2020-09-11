const express = require('express');
const { body, param } = require('express-validator');

const authCheck = require('../middleware/authCheck');
const requestIsValid = require('./utils/requestIsValid');

const Place = require('../models/Place');
const Review = require('../models/Review');

const router = express.Router();

// @route   GET /api/reviews/:id
// @desc    Get review
// @access  Public
router.get(
  '/:id',
  param('id', 'Please provide a valid review ID.').isMongoId(),
  async (req, res) => {
    if (!requestIsValid(req, res)) return;

    const { id } = req.params;

    try {
      const review = await Review.findById(id, { __v: 0 });

      if (!review) {
        res.status(404).json({ message: 'Review not found.' });
        return;
      }

      res.json(review);
    } catch (err) {
      console.log(err.message);
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
);

// @route   GET /api/reviews/for/:placeID
// @desc    Get all reviews for a place
// @access  Public
router.get(
  '/for/:placeID',
  param('placeID', 'Please provide a valid place ID.').isMongoId(),
  async (req, res) => {
    if (!requestIsValid(req, res)) return;

    const { placeID } = req.params;

    try {
      const place = await Place.findById(placeID);

      if (!place) {
        res.status(404).json({ message: `Place not found.` });
        return;
      }

      const reviews = await Review.find({ placeID }, { __v: 0 });
      res.json(reviews);
    } catch (err) {
      console.log(err.message);
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
);

// @route   POST /api/reviews/for/:placeID
// @desc    Post review for place
// @access  Private
router.post(
  '/for/:placeID',
  [
    authCheck,
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
      .isLength({ min: 1, max: 1000 })
  ],
  async (req, res) => {
    if (!requestIsValid(req, res)) return;

    const { placeID } = req.params;

    try {
      const place = await Place.findById(placeID);

      if (!place) {
        res.status(404).json({ message: 'Place not found.' });
        return;
      }

      if (place.ownerID === req.user.id) {
        res
          .status(403)
          .json({ message: 'Cannot write a review for your own place.' });
        return;
      }

      let review = await Review.findOne({
        userID: req.user.id,
        placeID: place._id
      });

      if (review) {
        res
          .status(403)
          .json({ message: 'Cannot write multiple reviews for one place.' });
        return;
      }

      const newReview = new Review({
        userID: req.user.id,
        placeID: place._id,
        ...req.body
      });

      review = await newReview.save();

      res.json(review);
    } catch (err) {
      console.log(err.message);
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
);

// @route   PUT /api/reviews/:id
// @desc    Edit review
// @access  Private
router.put(
  '/:id',
  [
    authCheck,
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
    body('placeID', 'Cannot change the place a review is for.').not().exists()
  ],
  async (req, res) => {
    if (!requestIsValid(req, res)) return;

    const { id } = req.params;

    try {
      let review = await Review.findById(id);

      if (!review) {
        res.status(404).json({ message: `Review not found.` });
        return;
      }

      if (review.userID !== req.user.id) {
        res.status(403).json({ message: 'Invalid credentials.' });
        return;
      }

      review = await Review.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, fields: { __v: 0 } }
      );

      res.json(review);
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
);

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete(
  '/:id',
  [authCheck, param('id', 'Please provide a valid review ID.').isMongoId()],
  async (req, res) => {
    if (!requestIsValid(req, res)) return;

    const { id } = req.params;

    try {
      let review = await Review.findById(id);

      if (!review) {
        res.status(404).json({ message: `Review not found.` });
        return;
      }

      if (review.userID !== req.user.id) {
        res.status(403).json({ message: 'Invalid credentials.' });
        return;
      }

      review = await Review.findByIdAndRemove(id);

      res.json({ message: 'Successfully deleted review.' });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
);

module.exports = router;
