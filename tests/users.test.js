import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import jwt from 'jsonwebtoken';

import prisma from '../src/prisma';

import getClient from './utils/getClient';
import seedDatabase, { userOne, userTwo } from './utils/seedDatabase';

import { createUser, loginUser, getUser, getMe } from './operations/user';

describe('User', () => {
  const defaultClient = getClient();

  beforeAll(seedDatabase);

  describe('Queries', () => {
    describe('user', () => {
      test('Returns correct user', async () => {
        const variables = { id: userOne.user.id };
        const { data } = await defaultClient.query({
          query: getUser,
          variables
        });

        expect(data.user.id).toBe(userOne.user.id);
      });

      test('Private fields are nulled on public profile', async () => {
        const variables = { id: userOne.user.id };
        const { data } = await defaultClient.query({
          query: getUser,
          variables
        });

        expect(data.user.email).toBe(null);
        expect(data.user.password).toBe(null);
        expect(data.user.reservations).toBe(null);
      });

      test('Private fields are nulled if authenticated but not user in question', async () => {
        const client = getClient(userTwo.jwt);

        const variables = { id: userOne.user.id };
        const { data } = await client.query({ query: getUser, variables });

        expect(data.user.email).toBe(null);
        expect(data.user.password).toBe(null);
        expect(data.user.reservations).toBe(null);
      });

      test('Private fields other than password are visible if authenticated and user in question', async () => {
        const client = getClient(userOne.jwt);

        const variables = { id: userOne.user.id };
        const { data } = await client.query({ query: getUser, variables });

        expect(data.user.email).toBe(userOne.user.email);
        expect(data.user.password).toBe(null);
        expect(data.user.reservations).toBeTruthy();
      });

      test('Error is thrown if user does not exist', async () => {
        const variables = { id: 'hasdlkshdflkj' };

        await expect(
          defaultClient.query({ query: getUser, variables })
        ).rejects.toThrow('User not found.');
      });
    });

    describe('me', () => {
      test('Returns correct info for logged-in user', async () => {
        const client = getClient(userOne.jwt);

        const { data } = await client.query({ query: getMe });

        expect(data.me.email).toBe(userOne.user.email);
      });

      test('Error is thrown if user does not exist (accounts for deactivation)', async () => {
        const token = jwt.sign(
          { userId: 'aslkdjlaskfd' },
          process.env.JWT_SECRET
        );

        const client = getClient(token);

        await expect(client.query({ query: getMe })).rejects.toThrow(
          'User not found.'
        );
      });
    });
  });

  test.skip('New user should be created in DB upon registration', async () => {
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

  test.skip('User registration should fail if password is too short', async () => {
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

  test.skip('Login should succeed with valid credentials', async () => {
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

  test.skip('Login should fail with nonexistent email', async () => {
    const variables = {
      data: { email: 'doesntexist@domain.tld', password: 'akdasjlsafj' }
    };

    await expect(
      defaultClient.mutate({ mutation: loginUser, variables })
    ).rejects.toThrow('Account does not exist.');
  });

  test.skip('Login should fail with incorrect password', async () => {
    const variables = {
      data: { email: 'emma@domain.tld', password: 'incorrect' }
    };

    await expect(
      defaultClient.mutate({ mutation: loginUser, variables })
    ).rejects.toThrow('Incorrect password.');
  });
});
