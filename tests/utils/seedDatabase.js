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
    password: bcrypt.hashSync('LFdx1ZZnXju6')
  },
  user: null,
  jwt: null
};

const seedDatabase = async () => {
  // Wipe database
  await prisma.mutation.deleteManyUsers();

  // Create dummy users
  userOne.user = await prisma.mutation.createUser({ data: userOne.input });
  userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET);

  userTwo.user = await prisma.mutation.createUser({ data: userTwo.input });
  userTwo.jwt = jwt.sign({ userId: userTwo.user.id }, process.env.JWT_SECRET);
};

export default seedDatabase;
