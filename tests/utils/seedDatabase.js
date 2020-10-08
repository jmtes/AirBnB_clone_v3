import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import prisma from '../../src/prisma';

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
    photos: { set: [] }
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
    photos: { set: [] }
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

const seedDatabase = async () => {
  // Wipe database
  await prisma.mutation.deleteManyReservations();
  await prisma.mutation.deleteManyListings();
  await prisma.mutation.deleteManyAmenities();
  await prisma.mutation.deleteManyCities();
  await prisma.mutation.deleteManyUsers();

  // Create dummy users
  userOne.user = await prisma.mutation.createUser({ data: userOne.input });
  userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET);

  userTwo.user = await prisma.mutation.createUser({ data: userTwo.input });
  userTwo.jwt = jwt.sign({ userId: userTwo.user.id }, process.env.JWT_SECRET);

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

  // Create dummy reservation
  reservationOne.reservation = await prisma.mutation.createReservation({
    data: {
      ...reservationOne.input,
      user: { connect: { id: userTwo.user.id } },
      listing: { connect: { id: listingOne.listing.id } }
    }
  });
};

export default seedDatabase;
