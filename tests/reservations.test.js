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
  listingTwo,
  reservationOne
} from './utils/seedDatabase';

import {
  createReservation,
  updateReservation,
  deleteReservation
} from './operations/reservation';

describe('Reservations', () => {
  const defaultClient = getClient();

  beforeAll(seedDatabase);

  describe('Mutations', () => {
    describe.skip('createReservation', () => {
      const defaultData = {
        checkin: new Date().toISOString(),
        checkout: new Date(
          new Date().getTime() + 1000 * 60 * 60 * 24 * 7
        ).toISOString()
      };

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

      // DB Changes
      test('New reservation appears in DB', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          listingId: listingTwo.listing.id,
          data: { ...defaultData }
        };

        const {
          data: {
            createReservation: { id }
          }
        } = await client.mutate({ mutation: createReservation, variables });

        const reservationExists = await prisma.exists.Reservation({ id });
        expect(reservationExists).toBe(true);
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

    describe.skip('updateReservation', () => {
      const defaultData = {
        checkin: new Date(
          new Date().getTime() + 1000 * 60 * 60 * 24 * 4
        ).toISOString(),
        checkout: new Date(
          new Date().getTime() + 1000 * 60 * 60 * 24 * 6
        ).toISOString()
      };

      // Authentication and Resource Existence
      test('Error is thrown if not authenticated', async () => {
        const variables = {
          id: reservationOne.reservation.id,
          data: { ...defaultData }
        };

        await expect(
          defaultClient.mutate({ mutation: updateReservation, variables })
        ).rejects.toThrow('Authentication required.');
      });

      test('Error is thrown if user account does not exist', async () => {
        const token = jwt.sign(
          { userId: 'hskjfhsldjkf' },
          process.env.JWT_SECRET
        );

        const client = getClient(token);

        const variables = {
          id: reservationOne.reservation.id,
          data: { ...defaultData }
        };

        await expect(
          client.mutate({ mutation: updateReservation, variables })
        ).rejects.toThrow('User account does not exist.');
      });

      test('Error is thrown if reservation does not exist', async () => {
        const client = getClient(userTwo.jwt);

        const variables = {
          id: 'kshflsd',
          data: { ...defaultData }
        };

        await expect(
          client.mutate({ mutation: updateReservation, variables })
        ).rejects.toThrow('Unable to edit reservation.');
      });

      test('Error is thrown if user does not own reservation', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          id: reservationOne.reservation.id,
          data: { ...defaultData }
        };

        await expect(
          client.mutate({ mutation: updateReservation, variables })
        ).rejects.toThrow('Unable to edit reservation.');
      });

      // DB Changes
      test('Reservation is updated in DB', async () => {
        const client = getClient(userTwo.jwt);

        const variables = {
          id: reservationOne.reservation.id,
          data: { ...defaultData }
        };

        const {
          data: {
            updateReservation: { id, checkin, checkout }
          }
        } = await client.mutate({ mutation: updateReservation, variables });

        expect(id).toBe(reservationOne.reservation.id);
        expect(checkin).toBe(defaultData.checkin);
        expect(checkout).toBe(defaultData.checkout);

        const dbWasUpdated = await prisma.exists.Reservation({
          id,
          checkin,
          checkout
        });

        expect(dbWasUpdated).toBe(true);
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

    describe('deleteReservation', () => {
      // Authentication and Resource Existence
      test('Error is thrown if not authenticated', async () => {
        const variables = { id: reservationOne.reservation.id };

        await expect(
          defaultClient.mutate({ mutation: deleteReservation, variables })
        ).rejects.toThrow('Authentication required.');
      });

      test('Error is thrown if user account does not exist', async () => {
        const token = jwt.sign(
          { userId: 'sjhdfjksdfl' },
          process.env.JWT_SECRET
        );

        const client = getClient(token);

        const variables = { id: reservationOne.reservation.id };

        await expect(
          client.mutate({ mutation: deleteReservation, variables })
        ).rejects.toThrow('User account does not exist.');
      });

      test('Error is thrown if reservation does not exist', async () => {
        const client = getClient(userTwo.jwt);

        const variables = { id: 'skdhflksdg' };

        await expect(
          client.mutate({ mutation: deleteReservation, variables })
        ).rejects.toThrow('Unable to cancel reservation.');
      });

      test('Error is thrown if reservation is not owned by user', async () => {
        const client = getClient(userOne.jwt);

        const variables = { id: reservationOne.reservation.id };

        await expect(
          client.mutate({ mutation: deleteReservation, variables })
        ).rejects.toThrow('Unable to cancel reservation.');
      });

      // DB Changes
      test('Reservation is removed from the DB', async () => {
        const client = getClient(userTwo.jwt);

        const variables = { id: reservationOne.reservation.id };

        const {
          data: {
            deleteReservation: { id }
          }
        } = await client.mutate({ mutation: deleteReservation, variables });

        const reservationStillExists = await prisma.exists.Reservation({ id });

        expect(reservationStillExists).toBe(false);
      });
    });
  });
});
