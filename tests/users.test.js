import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import jwt from 'jsonwebtoken';

import prisma from '../src/prisma';

import getClient from './utils/getClient';
import seedDatabase, { userOne, userTwo } from './utils/seedDatabase';

import {
  createUser,
  loginUser,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  getUser,
  getMe
} from './operations/user';

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

  describe('Mutations', () => {
    describe('createUser', () => {
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

      test('Error is thrown if invalid email is provided', async () => {
        const variables = {
          data: {
            name: 'Kate Page',
            email: 'invalid@mail',
            password: 'gecgecgec'
          }
        };

        await expect(
          defaultClient.mutate({ mutation: createUser, variables })
        ).rejects.toThrow('Invalid email provided.');
      });

      test('Error is thrown is email is already in use', async () => {
        const variables = {
          data: {
            name: userOne.user.name,
            email: userOne.user.email,
            password: 'password'
          }
        };

        await expect(
          defaultClient.mutate({ mutation: createUser, variables })
        ).rejects.toThrow('Email is already in use.');
      });

      test('Email should be normalized', async () => {
        const variables = {
          data: {
            name: 'Kate Page',
            email: 'KATE.PAGE@gmail.com',
            password: 'gecgecgec'
          }
        };

        await defaultClient.mutate({
          mutation: createUser,
          variables
        });

        const userExists = await prisma.exists.User({
          email: 'katepage@gmail.com'
        });

        expect(userExists).toBe(true);

        await prisma.mutation.deleteUser({
          where: { email: 'katepage@gmail.com' }
        });
      });

      test('Name input should be sanitized', async () => {
        const variables = {
          data: {
            name: '     <Kate Page>     ',
            email: 'kate@domain.tld',
            password: 'gecgecgec'
          }
        };

        const { data } = await defaultClient.mutate({
          mutation: createUser,
          variables
        });

        expect(data.createUser.user.name).toBe('&lt;Kate Page&gt;');

        await prisma.mutation.deleteUser({
          where: { email: 'kate@domain.tld' }
        });
      });

      test('Error should be thrown if name is too short', async () => {
        const variables = {
          data: {
            name: 'K',
            email: 'kate@domain.tld',
            password: 'gecgecgec'
          }
        };

        await expect(
          defaultClient.mutate({ mutation: createUser, variables })
        ).rejects.toThrow('Name must contain 2-32 characters.');
      });

      test('Error should be thrown if name is too long', async () => {
        const variables = {
          data: {
            name: 'Kate Page........................',
            email: 'kate@domain.tld',
            password: 'gecgecgec'
          }
        };

        await expect(
          defaultClient.mutate({ mutation: createUser, variables })
        ).rejects.toThrow('Name must contain 2-32 characters.');
      });

      test('Error should be thrown if password is too short', async () => {
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
    });

    describe('loginUser', () => {
      test('Should succeed with valid credentials', async () => {
        const variables = {
          data: { email: 'emma@domain.tld', password: 'LFdx1ZZnXju6' }
        };
        const { data } = await defaultClient.mutate({
          mutation: loginUser,
          variables
        });

        expect(data.loginUser.token).toBeTruthy();
        expect(data.loginUser.user.id).toBe(userOne.user.id);
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
    });

    describe('updateUserProfile', () => {
      test('Should update user info in DB', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          data: {
            name: 'Emma T.',
            avatar: 'emma-selfie.png',
            bio: 'I love to travel!'
          }
        };

        const {
          data: {
            updateUserProfile: { name, avatar, bio }
          }
        } = await client.mutate({
          mutation: updateProfile,
          variables
        });

        // Check returned data
        expect(name).toBe('Emma T.');
        expect(avatar).toBe('emma-selfie.png');
        expect(bio).toBe('I love to travel!');

        // Check Prisma record
        const userUpdated = await prisma.exists.User({
          name: 'Emma T.',
          avatar: 'emma-selfie.png',
          bio: 'I love to travel!'
        });

        expect(userUpdated).toBe(true);
      });

      test('Error is thrown if not authenticated', async () => {
        const variables = {
          data: {
            name: 'Unauthenticated'
          }
        };

        await expect(
          defaultClient.mutate({ mutation: updateProfile, variables })
        ).rejects.toThrow('Authentication required.');
      });

      test('Error is thrown if account does not exist', async () => {
        const token = jwt.sign(
          { userId: 'adjksafKhdskjf' },
          process.env.JWT_SECRET
        );

        const client = getClient(token);

        const variables = {
          data: {
            name: 'Just deactivated'
          }
        };

        await expect(
          client.mutate({ mutation: updateProfile, variables })
        ).rejects.toThrow('Account does not exist.');
      });

      test('Name should be sanitized', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          data: {
            name: '     <Emma Thomas>      '
          }
        };

        const {
          data: {
            updateUserProfile: { name }
          }
        } = await client.mutate({ mutation: updateProfile, variables });

        expect(name).toBe('&lt;Emma Thomas&gt;');
      });

      test('Error is thrown if name is too long', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          data: { name: 'Kate Page........................' }
        };

        await expect(
          client.mutate({ mutation: updateProfile, variables })
        ).rejects.toThrow('Name must contain 2-32 characters.');
      });

      test('Error is thrown if name is too short', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          data: { name: 'Kate Page........................' }
        };

        await expect(
          client.mutate({ mutation: updateProfile, variables })
        ).rejects.toThrow('Name must contain 2-32 characters.');
      });

      test('Error is thrown if avatar is not valid URL', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          data: {
            avatar: 'not a url'
          }
        };

        await expect(
          client.mutate({ mutation: updateProfile, variables })
        ).rejects.toThrow('Avatar must be a valid image URL.');
      });

      test('Error is thrown if avatar is not a PNG or JPG', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          data: {
            avatar: 'me.gif'
          }
        };

        await expect(
          client.mutate({ mutation: updateProfile, variables })
        ).rejects.toThrow('Avatar must be either a PNG or JP(E)G.');
      });

      test('Bio should be sanitized', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          data: {
            bio: '    I love to travel <3   '
          }
        };

        const {
          data: {
            updateUserProfile: { bio }
          }
        } = await client.mutate({ mutation: updateProfile, variables });

        expect(bio).toBe('I love to travel &lt;3');
      });

      test('Error is thrown if bio is too long', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          data: {
            bio:
              'arPSEv0x3L7nCvykarNcHUpHhdNyVHtU3OuTYEfu7tNEzGfWJcyFwhx0lWBpIoM3JijLNetAn17aIMT5phd249TnbuI1oMFWPI1vzEYwY1dKSJOgo8poAbYyqVUOsvZXK6FjgdOIHvKH6JgIeQIskWoDPPqeABftTkZdPvq3EqLSJwBBw70JcgIJOctCV5lrMpOKY7FmtdrQQaFTLQnQMAzAwizGI1K4hbvKjQnU9oeKnYS4qXT3Ja24htU07lHKLKVdWsJZCwEL0hAOVYAZKQNPIj65RPXafLJLHEu1NEHeuuiMYcsyIr4d2zHhMIKCh'
          }
        };

        await expect(
          client.mutate({ mutation: updateProfile, variables })
        ).rejects.toThrow('Bio may not exceed 320 characters.');
      });

      test('Should allow bio to be blank', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          data: {
            bio: ''
          }
        };

        const {
          data: {
            updateUserProfile: { bio }
          }
        } = await client.mutate({ mutation: updateProfile, variables });
        expect(bio).toBe('');
      });
    });

    describe('updateUserEmail', () => {
      test('Email change is reflected in DB', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          data: {
            email: '123emma@domain.tld',
            password: 'LFdx1ZZnXju6'
          }
        };

        await client.mutate({ mutation: updateEmail, variables });

        const updated = await prisma.exists.User({
          email: '123emma@domain.tld'
        });

        expect(updated).toBe(true);
      });

      test('Email should be normalized', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          data: {
            email: 'EMMA.THOMAS@gmail.com',
            password: 'LFdx1ZZnXju6'
          }
        };

        const {
          data: {
            updateUserEmail: { email }
          }
        } = await client.mutate({ mutation: updateEmail, variables });

        expect(email).toBe('emmathomas@gmail.com');
      });

      test('Error is thrown if not authenticated', async () => {
        const variables = {
          data: {
            email: 'newemail@domain.tld',
            password: 'gecgecgec'
          }
        };

        await expect(
          defaultClient.mutate({ mutation: updateEmail, variables })
        ).rejects.toThrow('Authentication required.');
      });

      test('Error is thrown if invalid email is provided', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          data: {
            email: 'emma@domain',
            password: 'LFdx1ZZnXju6'
          }
        };

        await expect(
          client.mutate({ mutation: updateEmail, variables })
        ).rejects.toThrow('Invalid email provided.');
      });

      test('Error is thrown if email is already taken', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          data: {
            email: userTwo.user.email,
            password: 'LFdx1ZZnXju6'
          }
        };

        await expect(
          client.mutate({ mutation: updateEmail, variables })
        ).rejects.toThrow('Email is already in use.');
      });

      test('Error is thrown if account does not exist', async () => {
        const token = jwt.sign(
          { userId: 'aksljdasld' },
          process.env.JWT_SECRET
        );

        const client = getClient(token);

        const variables = {
          data: {
            email: 'deactivated@domain.tld',
            password: 'LFdx1ZZnXju6'
          }
        };

        await expect(
          client.mutate({ mutation: updateEmail, variables })
        ).rejects.toThrow('Account does not exist.');
      });

      test('Error is thrown if incorrect password is given', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          data: {
            email: 'emma@domain.tld',
            password: 'incorrect'
          }
        };

        await expect(
          client.mutate({ mutation: updateEmail, variables })
        ).rejects.toThrow('Incorrect password.');
      });
    });

    describe('updateUserPassword', () => {
      test('Error is thrown if not authenticated', async () => {
        const variables = {
          data: {
            oldPassword: 'aksfjksldj',
            newPassword: 'jasflkjskl'
          }
        };

        await expect(
          defaultClient.mutate({ mutation: updatePassword, variables })
        ).rejects.toThrow('Authentication required.');
      });

      test('Error is thrown if account does not exist', async () => {
        const token = jwt.sign({ userId: 'asjdklsah' }, process.env.JWT_SECRET);

        const client = getClient(token);

        const variables = {
          data: {
            oldPassword: 'aksfjksldj',
            newPassword: 'jasflkjskl'
          }
        };

        await expect(
          client.mutate({ mutation: updatePassword, variables })
        ).rejects.toThrow('Account does not exist.');
      });

      test('Error is thrown if old password does not match', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          data: {
            oldPassword: 'incorrect!',
            newPassword: 'newpassword'
          }
        };

        await expect(
          client.mutate({ mutation: updatePassword, variables })
        ).rejects.toThrow('Incorrect password.');
      });

      test('Error is thrown if new password is too short', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          data: {
            oldPassword: 'LFdx1ZZnXju6',
            newPassword: '2short'
          }
        };

        await expect(
          client.mutate({ mutation: updatePassword, variables })
        ).rejects.toThrow('Password must contain at least 8 characters.');
      });

      test('Change is reflected in the DB', async () => {
        // Get old password
        let user = await prisma.query.user({ where: { id: userOne.user.id } });
        const oldPassword = user.password;

        const client = getClient(userOne.jwt);

        const variables = {
          data: {
            oldPassword: 'LFdx1ZZnXju6',
            newPassword: 'gecgecgec'
          }
        };

        await client.mutate({ mutation: updatePassword, variables });

        user = await prisma.query.user({
          where: { id: userOne.user.id }
        });
        const newPassword = user.password;

        expect(newPassword).not.toBe(oldPassword);
      });
    });

    describe('deleteUser', () => {
      test('Error is thrown if not authenticated', async () => {
        await expect(
          defaultClient.mutate({ mutation: deleteUser })
        ).rejects.toThrow('Authentication required.');
      });

      test('Error is thrown if account does not exist', async () => {
        const token = jwt.sign(
          { userId: 'ajslkdhsaldf' },
          process.env.JWT_SECRET
        );

        const client = getClient(token);

        await expect(client.mutate({ mutation: deleteUser })).rejects.toThrow(
          'Account does not exist'
        );
      });

      test('User deletion cascades', async () => {
        const client = getClient(userOne.jwt);

        await client.mutate({ mutation: deleteUser });

        const userStillExists = await prisma.exists.User({
          id: userOne.user.id
        });
        expect(userStillExists).toBe(false);

        // Make sure user listings have been deleted
        const userListingsExist = await prisma.exists.Listing({
          owner: { id: userOne.user.id }
        });
        expect(userListingsExist).toBe(false);
      });
    });
  });
});
