import bcrypt from 'bcryptjs';

import getUserId from './utils/getUserId';
import generateToken from './utils/generateToken';
import hashPassword from './utils/hashPassword';
import validation from './utils/validation';
import { getLocationData, getCityId } from './utils/location';
import updateListingRating from './utils/updateListingRating';

const {
  validateEmail,
  validateName,
  validateAvatar,
  validateBio,
  validateDesc,
  validatePhoto,
  validateDates,
  validateTitle,
  validateBody
} = validation;

const Mutation = {
  createUser: async (_parent, { data }, { prisma }) => {
    data.email = validateEmail(data.email);

    const emailTaken = await prisma.exists.User({ email: data.email });
    if (emailTaken) throw Error('Email is already in use.');

    const hashedPassword = await hashPassword(data.password);

    data.name = validateName(data.name, 32);

    const user = await prisma.mutation.createUser({
      data: { ...data, password: hashedPassword }
    });

    const token = generateToken(user.id);

    return { user, token };
  },
  loginUser: async (_parent, { data }, { prisma }) => {
    const user = await prisma.query.user({ where: { email: data.email } });
    if (!user) throw Error('Account does not exist.');

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw Error('Incorrect password.');

    const token = generateToken(user.id);

    return { token, user };
  },
  updateUserProfile: async (_parent, { data }, { req, prisma }, info) => {
    const id = getUserId(req);

    const userExists = await prisma.exists.User({ id });
    if (!userExists) throw Error('Account does not exist.');

    if (data.name) data.name = validateName(data.name, 32);
    if (data.avatar) data.avatar = validateAvatar(data.avatar);
    if (data.bio !== undefined) data.bio = validateBio(data.bio);

    return prisma.mutation.updateUser({ where: { id }, data }, info);
  },
  updateUserEmail: async (_parent, { data }, { req, prisma }, info) => {
    const id = getUserId(req);

    const user = await prisma.query.user({ where: { id } });
    if (!user) throw Error('Account does not exist.');

    data.email = validateEmail(data.email);

    const emailTaken = await prisma.exists.User({ email: data.email });
    if (emailTaken) throw Error('Email is already in use.');

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw Error('Incorrect password.');

    return prisma.mutation.updateUser(
      { where: { id }, data: { email: data.email } },
      info
    );
  },
  updateUserPassword: async (_parent, { data }, { req, prisma }, info) => {
    const id = getUserId(req);

    // Check that user exists
    const user = await prisma.query.user({ where: { id } });
    if (!user) throw Error('Account does not exist.');

    const isMatch = await bcrypt.compare(data.oldPassword, user.password);
    if (!isMatch) throw Error('Incorrect password.');

    const hashedPassword = await hashPassword(data.newPassword);

    return prisma.mutation.updateUser(
      { where: { id }, data: { password: hashedPassword } },
      info
    );
  },
  deleteUser: async (_parent, _args, { req, prisma }, info) => {
    // Make sure user is authenticated
    const id = getUserId(req);

    const userExists = await prisma.exists.User({ id });
    if (!userExists) throw Error('Account does not exist.');

    return prisma.mutation.deleteUser({ where: { id } }, info);
  },
  createListing: async (_parent, { data }, { req, prisma }, info) => {
    // Make sure user is authenticated
    const userId = getUserId(req);

    // Make sure user actually exists
    const userExists = await prisma.exists.User({ id: userId });
    if (!userExists) throw Error('User account does not exist.');

    // Validate name and description
    data.name = validateName(data.name, 50);
    data.desc = validateDesc(data.desc);

    // Make sure all items in photos array are valid image URLs
    data.photos.forEach((photo) => validatePhoto(photo));
    data.photos = { set: data.photos };

    // Map amenities
    data.amenities = {
      connect: data.amenities.map((amenity) => ({ enum: amenity }))
    };

    // Validate address
    const locationData = await getLocationData(data.address);
    data.latitude = parseInt(locationData.lat, 10);
    data.longitude = parseInt(locationData.lon, 10);

    // Get city id
    const cityId = await getCityId(locationData, prisma);

    return prisma.mutation.createListing(
      {
        data: {
          ...data,
          owner: { connect: { id: userId } },
          city: { connect: { id: cityId } }
        }
      },
      info
    );
  },
  updateListing: async (_parent, { id, data }, { req, prisma }, info) => {
    // Make sure user is authenticated
    const userId = getUserId(req);

    // Make sure user exists
    const userExists = await prisma.exists.User({ id: userId });
    if (!userExists) throw Error('User account does not exist.');

    // Make sure user owns listing
    const userOwnsListing = await prisma.exists.Listing({
      id,
      owner: { id: userId }
    });
    if (!userOwnsListing) throw Error('Unable to update listing.');

    // Validate and sanitize name and description
    if (data.name !== undefined) data.name = validateName(data.name, 50);
    if (data.desc !== undefined) data.desc = validateDesc(data.desc);

    // Make sure all items in photos array are valid image URLs
    if (data.photos) {
      data.photos.forEach((photo) => validatePhoto(photo));
      data.photos = { set: data.photos };
    }

    // Map amenities for connection
    if (data.amenities) {
      data.amenities = {
        set: data.amenities.map((amenity) => ({ enum: amenity }))
      };
    }

    return prisma.mutation.updateListing({ where: { id }, data }, info);
  },
  deleteListing: async (_parent, { id }, { req, prisma }, info) => {
    // Make sure user is authenticated
    const userId = getUserId(req);

    // Make sure user account exists
    const userExists = await prisma.exists.User({ id: userId });
    if (!userExists) throw Error('User account does not exist.');

    // Make sure listing exists and is owned by user
    const userOwnsListing = await prisma.exists.Listing({
      id,
      owner: { id: userId }
    });
    if (!userOwnsListing) throw Error('Unable to remove listing.');

    return prisma.mutation.deleteListing({ where: { id } }, info);
  },
  createReservation: async (
    _parent,
    { listingId, data },
    { req, prisma },
    info
  ) => {
    // Make sure user is authenticated
    const userId = getUserId(req);

    // Make sure user exists
    const userExists = await prisma.exists.User({ id: userId });
    if (!userExists) throw Error('User account does not exist.');

    // Make sure listing exists
    const listing = await prisma.query.listing(
      { where: { id: listingId } },
      '{ id owner { id } }'
    );
    if (!listing) throw Error('Listing does not exist.');

    // Make sure user is not listing owner
    if (listing.owner.id === userId)
      throw Error('Cannot make reservation for your own listing.');

    // Validate checkin and checkout dates
    validateDates(data.checkin, data.checkout);

    return prisma.mutation.createReservation(
      {
        data: {
          ...data,
          user: { connect: { id: userId } },
          listing: { connect: { id: listing.id } }
        }
      },
      info
    );
  },
  updateReservation: async (_parent, { id, data }, { req, prisma }, info) => {
    // Make sure user is authenticated
    const userId = getUserId(req);

    // Make sure user account exists
    const userExists = await prisma.exists.User({ id: userId });
    if (!userExists) throw Error('User account does not exist.');

    // Make sure reservation exists and is attributed to user
    const reservationExists = await prisma.exists.Reservation({
      id,
      user: { id: userId }
    });
    if (!reservationExists) throw Error('Unable to edit reservation.');

    // Validate checkin and checkout
    validateDates(data.checkin, data.checkout);

    return prisma.mutation.updateReservation({ where: { id }, data }, info);
  },
  deleteReservation: async (_parent, { id }, { req, prisma }, info) => {
    // Make sure user is authenticated
    const userId = getUserId(req);

    // Make sure user account exists
    const userExists = await prisma.exists.User({ id: userId });
    if (!userExists) throw Error('User account does not exist.');

    // Make sure reservation exists and is attributed to user
    const reservationExists = await prisma.exists.Reservation({
      id,
      user: { id: userId }
    });
    if (!reservationExists) throw Error('Unable to cancel reservation.');

    return prisma.mutation.deleteReservation({ where: { id } }, info);
  },
  createReview: async (_parent, { listingId, data }, { req, prisma }, info) => {
    // Make sure user is authenticated
    const userId = getUserId(req);

    // Make sure user account exists
    const userExists = await prisma.exists.User({ id: userId });
    if (!userExists) throw Error('User account does not exist.');

    // Make sure listing exists
    const listing = await prisma.query.listing(
      { where: { id: listingId } },
      '{ id owner { id } }'
    );
    if (!listing) throw Error('Listing does not exist.');

    // Make sure user does not own listing
    if (listing.owner.id === userId)
      throw Error('Cannot write a review for your own listing.');

    // Make sure user hasn't already written a review for the listing
    const hasMadeReview = await prisma.exists.Review({
      author: { id: userId },
      listing: { id: listing.id }
    });
    if (hasMadeReview)
      throw Error('Cannot write multiple reviews for one place.');

    // Make sure rating is between 1 and 5
    if (data.rating < 1 || data.rating > 5)
      throw Error('Rating must be on a scale between 1 and 5.');

    // Validate and sanitize title and body
    if (data.title !== undefined) data.title = validateTitle(data.title);
    if (data.body !== undefined) data.body = validateBody(data.body);

    // Create review
    const review = await prisma.mutation.createReview({
      data: {
        ...data,
        author: { connect: { id: userId } },
        listing: { connect: { id: listing.id } }
      }
    });

    // Update average listing rating
    await updateListingRating(review, listing.id, 'CREATE', prisma);

    return prisma.query.review({ where: { id: review.id } }, info);
  },
  updateReview: async (_parent, { id, data }, { req, prisma }, info) => {
    // Make sure user is authenticated
    const userId = getUserId(req);

    // Make sure user account exists
    const userExists = await prisma.exists.User({ id: userId });
    if (!userExists) throw Error('User account does not exist.');

    // Make sure review exists and was written by user
    let reviewExists = await prisma.exists.Review({
      id,
      author: { id: userId }
    });
    if (!reviewExists) throw Error('Unable to edit review.');
  }
};

export default Mutation;
