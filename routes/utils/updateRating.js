const Review = require('../../models/Review');
const Place = require('../../models/Place');

const updateRating = async (placeID) => {
  const reviews = await Review.find({ placeID });

  const reducer = (sum, current) => {
    return sum + current.stars;
  };

  const count = reviews.length;
  const ratingSum = reviews.reduce(reducer, 0);

  const avg = ratingSum / count;

  await Place.findByIdAndUpdate(placeID, { rating: avg });
};

module.exports = { updateRating };
