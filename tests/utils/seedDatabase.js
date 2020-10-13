import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import prisma from '../../src/prisma';

import { jwtSecret } from '../../config';

export const userOne = {
  input: {
    name: 'Emma Thomas',
    email: 'emma@domain.tld',
    password: bcrypt.hashSync('LFdx1ZZnXju6')
  },
  user: null,
  jwt: null
};

export const userTwo = {
  input: {
    name: 'Parvana Khan',
    email: 'parvana@domain.tld',
    password: bcrypt.hashSync('LFdx1ZZnXju7')
  },
  user: null,
  jwt: null
};

export const userThree = {
  input: {
    name: 'Theo Morton',
    email: 'theo@domain.tld',
    password: bcrypt.hashSync('LFdx1ZZnXju8')
  }
};

export const cityOne = {
  input: {
    name: 'Chula Vista',
    state: 'California',
    country: 'United States of America',
    latitude: 32.6400541,
    longitude: -117.0841955,
    photo:
      'https://wp-tid.zillowstatic.com/hotpads/2/shutterstock_262860722-66022b.jpg'
  },
  city: null
};

export const cityTwo = {
  input: {
    name: 'Miami',
    state: 'Florida',
    country: 'United States of America',
    latitude: 25.7742658,
    longitude: -80.1936589,
    photo:
      'https://images.unsplash.com/photo-1561518750-dc5af942d719?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80'
  },
  city: null
};

export const cityThree = {
  input: {
    name: 'Quezon City',
    region: 'Metro Manila',
    country: 'Philippines',
    latitude: 14.6509905,
    longitude: 121.0486155,
    photo:
      'https://images.unsplash.com/photo-1598258710957-db8614c2881e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1267&q=80'
  },
  city: null
};

const amenityOne = {
  input: { name: 'Wifi', enum: 'WIFI' },
  amenity: null
};

const amenityTwo = {
  input: { name: 'Air conditioning', enum: 'AIR_CONDITIONING' },
  amenity: null
};

const amenityThree = {
  input: { name: 'Kitchen', enum: 'KITCHEN' },
  amenity: null
};

export const listingOne = {
  input: {
    name: 'Waterfront with Great View',
    desc:
      'Relax in the sun on this private waterfront terrace with an unobstructed view of the San Diego Bay',
    address: '907 Marina Way',
    latitude: 32.619707,
    longitude: -117.098772,
    beds: 3,
    baths: 2,
    maxGuests: 6,
    price: 398,
    amenities: { connect: [{ name: 'Air conditioning' }, { name: 'Wifi' }] },
    photos: { set: [] },
    ratingSum: 5,
    reviewCount: 1,
    rating: 5
  },
  listing: null
};

export const listingTwo = {
  input: {
    name: 'Romantic Cabana',
    desc:
      'A charming cabana located on the beach with a great view. A place to relax and unwind.',
    address: '5940 N Bay Road',
    latitude: 25.841604,
    longitude: -80.132435,
    beds: 2,
    baths: 1,
    maxGuests: 2,
    price: 370,
    amenities: { connect: [{ name: 'Kitchen' }, { name: 'Air conditioning' }] },
    photos: { set: [] },
    ratingSum: 4,
    reviewCount: 1,
    rating: 4
  },
  listing: null
};

export const listingThree = {
  input: {
    name: 'Private room + shared bathroom in main house',
    desc:
      'Private room with shared bathroom in home located in gated community in North Chula Vista. The property is freeway close and super close to the most popular casinos, shopping centers, restaurants, cafes, hiking trails & golf in the area. Please note that this property is an HOA community. As such, it is important to abide by all HOA rules.',
    address: '1530 Winter Ln',
    latitude: 32.633113,
    longitude: -116.93835,
    beds: 1,
    baths: 1,
    maxGuests: 2,
    price: 55,
    amenities: {
      connect: [
        { name: 'Kitchen' },
        { name: 'Air conditioning' },
        { name: 'Wifi' }
      ]
    },
    photos: {
      set: [
        'https://a0.muscache.com/im/pictures/06da37a6-5f47-4635-af77-d643803aa579.jpg'
      ]
    },
    ratingSum: 0,
    reviewCount: 0,
    rating: 0
  },
  listing: null
};

export const reservationOne = {
  input: {
    checkin: new Date(
      new Date().getTime() + 1000 * 60 * 60 * 24 * 2
    ).toISOString(),
    checkout: new Date(
      new Date().getTime() + 1000 * 60 * 60 * 24 * 7
    ).toISOString()
  },
  reservation: null
};

export const reservationTwo = {
  input: {
    checkin: new Date(
      new Date().getTime() + 1000 * 60 * 60 * 24 * 8
    ).toISOString(),
    checkout: new Date(
      new Date().getTime() + 1000 * 60 * 60 * 24 * 10
    ).toISOString()
  },
  reservation: null
};

export const reservationThree = {
  input: {
    checkin: new Date(
      new Date().getTime() + 1000 * 60 * 60 * 24 * 24
    ).toISOString(),
    checkout: new Date(
      new Date().getTime() + 1000 * 60 * 60 * 24 * 26
    ).toISOString()
  },
  reservation: null
};

export const reservationFour = {
  input: {
    checkin: new Date(
      new Date().getTime() + 1000 * 60 * 60 * 24 * 40
    ).toISOString(),
    checkout: new Date(
      new Date().getTime() + 1000 * 60 * 60 * 24 * 42
    ).toISOString()
  },
  reservation: null
};

export const reviewOne = {
  input: {
    rating: 5,
    title: 'Amazing stay',
    body: 'Beautiful home with a grill and hot tub and close to everything'
  },
  review: null
};

export const reviewTwo = {
  input: {
    rating: 4,
    title: 'Good place, but...',
    body:
      'The photos are very accurate, there were no surprises. However, the cabana could use some renovations.'
  },
  review: null
};

const seedDatabase = async () => {
  // Wipe database
  await prisma.mutation.deleteManyReviews();
  await prisma.mutation.deleteManyReservations();
  await prisma.mutation.deleteManyListings();
  await prisma.mutation.deleteManyAmenities();
  await prisma.mutation.deleteManyCities();
  await prisma.mutation.deleteManyUsers();

  // Create dummy users
  userOne.user = await prisma.mutation.createUser({ data: userOne.input });
  userOne.jwt = jwt.sign({ userId: userOne.user.id }, jwtSecret);

  userTwo.user = await prisma.mutation.createUser({ data: userTwo.input });
  userTwo.jwt = jwt.sign({ userId: userTwo.user.id }, jwtSecret);

  userThree.user = await prisma.mutation.createUser({ data: userThree.input });
  userThree.jwt = jwt.sign({ userId: userThree.user.id }, jwtSecret);

  // Create dummy cities
  cityOne.city = await prisma.mutation.createCity({ data: cityOne.input });
  cityTwo.city = await prisma.mutation.createCity({ data: cityTwo.input });
  cityThree.city = await prisma.mutation.createCity({ data: cityThree.input });

  // Create dummy amenities
  amenityOne.amenity = await prisma.mutation.createAmenity({
    data: amenityOne.input
  });
  amenityTwo.amenity = await prisma.mutation.createAmenity({
    data: amenityTwo.input
  });
  amenityThree.amenity = await prisma.mutation.createAmenity({
    data: amenityThree.input
  });

  // Create dummy listings
  listingOne.listing = await prisma.mutation.createListing({
    data: {
      ...listingOne.input,
      owner: { connect: { id: userOne.user.id } },
      city: { connect: { id: cityOne.city.id } }
    }
  });
  listingTwo.listing = await prisma.mutation.createListing({
    data: {
      ...listingTwo.input,
      owner: { connect: { id: userTwo.user.id } },
      city: { connect: { id: cityTwo.city.id } }
    }
  });
  listingThree.listing = await prisma.mutation.createListing({
    data: {
      ...listingThree.input,
      owner: { connect: { id: userOne.user.id } },
      city: { connect: { id: cityOne.city.id } }
    }
  });

  // Create dummy reservations
  reservationOne.reservation = await prisma.mutation.createReservation({
    data: {
      ...reservationOne.input,
      user: { connect: { id: userTwo.user.id } },
      listing: { connect: { id: listingOne.listing.id } }
    }
  });
  reservationTwo.reservation = await prisma.mutation.createReservation({
    data: {
      ...reservationTwo.input,
      user: { connect: { id: userOne.user.id } },
      listing: { connect: { id: listingTwo.listing.id } }
    }
  });
  reservationThree.reservation = await prisma.mutation.createReservation({
    data: {
      ...reservationThree.input,
      user: { connect: { id: userOne.user.id } },
      listing: { connect: { id: listingTwo.listing.id } }
    }
  });
  reservationFour.reservation = await prisma.mutation.createReservation({
    data: {
      ...reservationFour.input,
      user: { connect: { id: userOne.user.id } },
      listing: { connect: { id: listingTwo.listing.id } }
    }
  });

  // Create dummy reviews
  reviewOne.review = await prisma.mutation.createReview({
    data: {
      ...reviewOne.input,
      author: { connect: { id: userTwo.user.id } },
      listing: { connect: { id: listingOne.listing.id } }
    }
  });
  reviewTwo.review = await prisma.mutation.createReview({
    data: {
      ...reviewTwo.input,
      author: { connect: { id: userOne.user.id } },
      listing: { connect: { id: listingTwo.listing.id } }
    }
  });
};

export default seedDatabase;
