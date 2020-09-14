import Review from '../../models/Review';
import Place from '../../models/Place';

export default async (placeID) => {
  const reviews = await Review.find({ placeID });

  const reducer = (sum, current) => {
    return sum + current.stars;
  };

  const count = reviews.length;
  const ratingSum = reviews.reduce(reducer, 0);

  const avg = ratingSum / count;

  await Place.findByIdAndUpdate(placeID, { rating: avg });
};
