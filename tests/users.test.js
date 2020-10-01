import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import prisma from '../src/prisma';

import getClient from './utils/getClient';
import seedDatabase, { userOne } from './utils/seedDatabase';

import { createUser, loginUser, getUsers, getMe } from './operations/user';

describe('User Queries and Mutations', () => {
  const defaultClient = getClient();

  beforeAll(seedDatabase);

  test('New user should be created in DB upon registration', async () => {
    const variables = {
      data: {
        name: 'Kate Page',
        email: 'kate@domain.tld',
        password: 'QhzuCsao'
      }
    };

    const { data } = await defaultClient.mutate({
      mutation: createUser,
      variables
    });

    const userExists = await prisma.exists.User({
      id: data.createUser.user.id
    });

    expect(userExists).toBe(true);

    await prisma.mutation.deleteUser({
      where: { id: data.createUser.user.id }
    });
  });

  test('User registration should fail if password is too short', async () => {
    const variables = {
      data: {
        name: 'Kate Page',
        email: 'kate@domain.tld',
        password: '2short'
      }
    };

    await expect(
      defaultClient.mutate({ mutation: createUser, variables })
    ).rejects.toThrow('Password must contain at least 8 characters.');
  });

  test('User emails should be hidden in public profiles', async () => {
    const { data } = await defaultClient.query({ query: getUsers });

    expect(data.users.length).toBe(2);
    expect(data.users[0].email).toBe(null);
    expect(data.users[0].name).toBe('Emma Thomas');
  });

  test('Login should succeed with valid credentials', async () => {
    const variables = {
      data: { email: 'emma@domain.tld', password: 'LFdx1ZZnXju6' }
    };
    const { data } = await defaultClient.mutate({
      mutation: loginUser,
      variables
    });

    expect(data.loginUser.token).toBeTruthy();
    expect(data.loginUser.user.name).toBe('Emma Thomas');
  });

  test('Login should fail with nonexistent email', async () => {
    const variables = {
      data: { email: 'doesntexist@domain.tld', password: 'akdasjlsafj' }
    };

    await expect(
      defaultClient.mutate({ mutation: loginUser, variables })
    ).rejects.toThrow('Account does not exist.');
  });

  test('Login should fail with incorrect password', async () => {
    const variables = {
      data: { email: 'emma@domain.tld', password: 'incorrect' }
    };

    await expect(
      defaultClient.mutate({ mutation: loginUser, variables })
    ).rejects.toThrow('Incorrect password.');
  });

  test('Querying me returns correct info for logged-in user', async () => {
    const client = getClient(userOne.jwt);

    const { data } = await client.query({ query: getMe });

    expect(data.me.email).toBe(userOne.user.email);
  });
});
