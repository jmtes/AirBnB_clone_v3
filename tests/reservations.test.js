import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import jwt from 'jsonwebtoken';

import prisma from '../src/prisma';

import getClient from './utils/getClient';
import seedDatabase, {
  userOne,
  userTwo,
  listingOne,
  listingTwo
} from './utils/seedDatabase';

import { createReservation } from './operations/reservation';

describe('Reservations', () => {
  const defaultClient = getClient();

  beforeAll(seedDatabase);

  describe('Mutations', () => {
    const defaultData = {
      checkin: new Date().toISOString(),
      checkout: new Date(
        new Date().getTime() + 1000 * 60 * 60 * 24 * 7
      ).toISOString()
    };

    describe('createReservation', () => {
      // Authentication and Resource Existence
      test('Error is thrown if not authenticated', async () => {
        const variables = {
          listingId: listingOne.listing.id,
          data: { ...defaultData }
        };

        await expect(
          defaultClient.mutate({ mutation: createReservation, variables })
        ).rejects.toThrow('Authentication required.');
      });

      test('Error is thrown if user account does not exist', async () => {
        const token = jwt.sign(
          { userId: 'ahfkjsdsdjkfj' },
          process.env.JWT_SECRET
        );

        const client = getClient(token);

        const variables = {
          listingId: listingOne.listing.id,
          data: { ...defaultData }
        };

        await expect(
          client.mutate({ mutation: createReservation, variables })
        ).rejects.toThrow('User account does not exist.');
      });

      test('Error is thrown if listing does not exist', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          listingId: 'ajslksdjfsdlf',
          data: { ...defaultData }
        };

        await expect(
          client.mutate({ mutation: createReservation, variables })
        ).rejects.toThrow('Listing does not exist.');
      });

      test('Error is thrown if user is listing owner', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          listingId: listingOne.listing.id,
          data: { ...defaultData }
        };

        await expect(
          client.mutate({ mutation: createReservation, variables })
        ).rejects.toThrow('Cannot make reservation for your own listing.');
      });

      // Input Validation
      test('Error is thrown if checkin is not a valid ISO string', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          listingId: listingTwo.listing.id,
          data: { ...defaultData, checkin: 'October 7, 2020' }
        };

        await expect(
          client.mutate({ mutation: createReservation, variables })
        ).rejects.toThrow('Checkin and checkout must be valid ISO strings.');
      });

      test('Error is thrown if checkout is not a valid ISO string', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          listingId: listingTwo.listing.id,
          data: { ...defaultData, checkout: 'October 7, 2020' }
        };

        await expect(
          client.mutate({ mutation: createReservation, variables })
        ).rejects.toThrow('Checkin and checkout must be valid ISO strings.');
      });

      test("Error is thrown if checkin is before today's date", async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          listingId: listingTwo.listing.id,
          data: {
            ...defaultData,
            checkin: new Date('September 7, 2020').toISOString()
          }
        };

        await expect(
          client.mutate({ mutation: createReservation, variables })
        ).rejects.toThrow("Checkin cannot be before today's date.");
      });

      test('Error is thrown if checkout is before checkin', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          listingId: listingTwo.listing.id,
          data: {
            ...defaultData,
            checkout: new Date('September 7, 2020').toISOString()
          }
        };

        await expect(
          client.mutate({ mutation: createReservation, variables })
        ).rejects.toThrow('Checkout cannot be before checkin date.');
      });

      test('Same day checkin and checkout should be allowed', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          listingId: listingTwo.listing.id,
          data: {
            ...defaultData,
            checkout: defaultData.checkin
          }
        };

        await client.mutate({ mutation: createReservation, variables });
      });
    });
  });
});
