const requestIsValid = require('../utils/requestIsValid');

const Place = require('../../models/Place');
const Review = require('../../models/Review');

const getReview = async (req, res) => {
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
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};

const getReviewsForPlace = async (req, res) => {
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
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};

const postReview = async (req, res) => {
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
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};

const editReview = async (req, res) => {
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
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};

const deleteReview = async (req, res) => {
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
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};

module.exports = {
  getReview,
  getReviewsForPlace,
  postReview,
  editReview,
  deleteReview
};
