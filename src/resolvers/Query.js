import getUserId from './utils/getUserId';

const Query = {
  user: async (_parent, { id }, { prisma }, info) => {
    const user = await prisma.query.user({ where: { id } }, info);

    if (!user) throw Error('User not found.');
    return user;
  },
  me: async (_parent, _args, { req, prisma }, info) => {
    const userId = getUserId(req);

    const user = await prisma.query.user({ where: { id: userId } }, info);

    if (!user) throw Error('User not found.');
    return user;
  },
  cities: (
    _parent,
    { query, first, skip, after, orderBy },
    { prisma },
    info
  ) => {
    const opArgs = { first, skip, after, orderBy };

    if (query)
      opArgs.where = {
        OR: [
          { name_contains: query },
          { state_contains: query },
          { region_contains: query },
          { country_contains: query }
        ]
      };

    return prisma.query.cities(opArgs, info);
  },
  city: async (_parent, { id }, { prisma }, info) => {
    const city = await prisma.query.city({ where: { id } }, info);
    if (!city) throw Error('City not found.');

    return city;
  },
  listings: (
    _parent,
    {
      owner,
      city,
      amenities,
      beds,
      baths,
      guests,
      price,
      rating,
      first,
      skip,
      after,
      orderBy
    },
    { prisma },
    info
  ) => {
    const opArgs = { first, skip, after, orderBy, where: {} };

    if (owner) opArgs.where.owner = { id: owner };
    if (city) opArgs.where.city = { id: city };
    if (amenities) {
      const amenityMap = amenities.map((amenity) => ({
        amenities_some: { enum: amenity }
      }));
      opArgs.where.AND = amenityMap;
    }
    if (beds !== undefined) opArgs.where.beds_gte = beds;
    if (baths !== undefined) opArgs.where.baths_gte = baths;
    if (guests !== undefined) opArgs.where.maxGuests_gte = guests;
    if (price !== undefined) opArgs.where.price_lte = price;
    if (rating !== undefined) opArgs.where.rating_gte = rating;

    return prisma.query.listings(opArgs, info);
  },
  listing: async (_parent, { id }, { prisma }, info) => {
    const listing = await prisma.query.listing({ where: { id } }, info);
    if (!listing) throw Error('Listing not found.');

    return listing;
  },
  reservations: async (
    _parent,
    { user, listing, first, skip, after, orderBy },
    { req, prisma },
    info
  ) => {
    // Make sure user is authenticated
    const userId = getUserId(req);

    // Make sure user account exists
    const userExists = await prisma.exists.User({ id: userId });
    if (!userExists) throw Error('User account does not exist.');

    // Make sure only either user or listing is provided
    // The logic being is that, in making this query, you should be either a user viewing reservations you've made or a listing owner viewing reservations made for a listing of yours.
    // Thus, it would not make sense for both to be provided.
    if (!user === !listing)
      throw Error('Either user or listing argument must be provided.');

    const opArgs = { first, skip, after, orderBy, where: {} };

    if (user) {
      // Make sure user ids match
      if (user !== userId) throw Error('Unable to get reservations.');

      opArgs.where.user = { id: userId };
    }
    if (listing) {
      // Make sure listing exists and is owned by user
      const userOwnsListing = await prisma.exists.Listing({
        id: listing,
        owner: { id: userId }
      });
      if (!userOwnsListing) throw Error('Unable to get reservations.');

      opArgs.where.listing = { id: listing };
    }

    return prisma.query.reservations(opArgs, info);
  },
  reviews: (
    _parent,
    { author, listing, rating, first, skip, after, orderBy },
    { prisma },
    info
  ) => {
    const opArgs = { first, skip, after, orderBy, where: {} };

    if (author) opArgs.where.author = { id: author };
    if (listing) opArgs.where.listing = { id: listing };
    if (rating) opArgs.where.rating = rating;

    return prisma.query.reviews(opArgs, info);
  }
};

export default Query;
