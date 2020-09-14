import Place from '../../models/Place';
import Review from '../../models/Review';

import updateRating from './utils';

export const getReview = async (req, res) => {
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

export const postReview = async (req, res) => {
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

    await updateRating(placeID);

    res.json(review);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};

export const editReview = async (req, res) => {
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

    await updateRating(review.placeID);

    res.json(review);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};

export const deleteReview = async (req, res) => {
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

    await updateRating(review.placeID);

    res.json({ message: 'Successfully deleted review.' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};
