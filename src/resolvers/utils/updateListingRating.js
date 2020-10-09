const updateListingRating = async (review, listingId, mutation, prisma) => {
  const listing = await prisma.query.listing(
    { where: { id: listingId } },
    '{ ratingSum reviewCount rating }'
  );

  const data = {
    ratingSum: listing.ratingSum,
    reviewCount: listing.reviewCount,
    rating: listing.rating
  };

  if (mutation === 'CREATE') {
    data.ratingSum += review.rating;
    data.reviewCount += 1;
    data.rating = parseInt((data.ratingSum / data.reviewCount).toFixed(2), 10);

    await prisma.mutation.updateListing({ where: { id: listingId }, data });
  }
};

export default updateListingRating;
