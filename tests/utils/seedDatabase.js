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

const seedDatabase = async () => {
  // Wipe database
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
};

export default seedDatabase;
