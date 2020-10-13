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
  reservationOne,
  reservationTwo,
  reservationThree,
  reservationFour
} from './utils/seedDatabase';

import {
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation
} from './operations/reservation';

import { jwtSecret } from '../config';

describe('Reservations', () => {
  const defaultClient = getClient();

  beforeAll(seedDatabase);

  describe('Queries', () => {
    describe('reservations', () => {
      // Authentication
      test('Error is thrown if not authenticated', async () => {
        await expect(
          defaultClient.query({ query: getReservations })
        ).rejects.toThrow('Authentication required.');
      });

      test('Error is thrown if user account does not exist', async () => {
        const token = jwt.sign({ userId: 'jasklfhdsl' }, jwtSecret);

        const client = getClient(token);

        await expect(client.query({ query: getReservations })).rejects.toThrow(
          'User account does not exist.'
        );
      });

      test('Error is thrown if neither user nor listing arg is provided', async () => {
        const client = getClient(userOne.jwt);

        await expect(client.query({ query: getReservations })).rejects.toThrow(
          'Either user or listing argument must be provided.'
        );
      });

      test('Error is thrown if both user and listing args are provided', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          user: userOne.user.id,
          listing: listingOne.listing.id
        };

        await expect(
          client.query({ query: getReservations, variables })
        ).rejects.toThrow('Either user or listing argument must be provided.');
      });

      test('Error is thrown if specified user is not the same as authenticated user', async () => {
        const client = getClient(userOne.jwt);

        const variables = { user: userTwo.user.id };

        await expect(
          client.query({ query: getReservations, variables })
        ).rejects.toThrow('Unable to get reservations.');
      });

      test('Error is thrown if specified listing is not owned by authenticated user', async () => {
        const client = getClient(userOne.jwt);

        const variables = { listing: listingTwo.listing.id };

        await expect(
          client.query({ query: getReservations, variables })
        ).rejects.toThrow('Unable to get reservations.');
      });

      test('Error is thrown if specified listing does not exist', async () => {
        const client = getClient(userOne.jwt);

        const variables = { listing: 'shdfjksdf' };

        await expect(
          client.query({ query: getReservations, variables })
        ).rejects.toThrow('Unable to get reservations.');
      });

      // Gets correct data
      test('User arg filters out reservations not made by specified user', async () => {
        const client = getClient(userOne.jwt);

        const variables = { user: userOne.user.id };

        const {
          data: { reservations }
        } = await client.query({ query: getReservations, variables });

        expect(reservations.length).toBe(3);

        const allMadeByUser = reservations.every(
          (res) => res.user.id === userOne.user.id
        );
        expect(allMadeByUser).toBe(true);
      });

      test('Listing arg filters out reservations not made for specified listing', async () => {
        const client = getClient(userTwo.jwt);

        const variables = { listing: listingTwo.listing.id };

        const {
          data: { reservations }
        } = await client.query({ query: getReservations, variables });

        expect(reservations.length).toBe(3);

        const allMadeForListing = reservations.every(
          (res) => res.listing.id === listingTwo.listing.id
        );
        expect(allMadeForListing).toBe(true);
      });

      // Pagination and sorting
      test('First arg gets only first n reservations', async () => {
        const client = getClient(userOne.jwt);

        const variables = { user: userOne.user.id, first: 2 };

        const {
          data: { reservations }
        } = await client.query({ query: getReservations, variables });

        expect(reservations.length).toBe(2);
        expect(reservations[0].id).toBe(reservationTwo.reservation.id);
        expect(reservations[1].id).toBe(reservationThree.reservation.id);
      });

      test('Skip arg skips first n reservations', async () => {
        const client = getClient(userTwo.jwt);

        const variables = { listing: listingTwo.listing.id, skip: 2 };

        const {
          data: { reservations }
        } = await client.query({ query: getReservations, variables });

        expect(reservations.length).toBe(1);
        expect(reservations[0].id).toBe(reservationFour.reservation.id);
      });

      test('After arg gets only reservations that come after specified resrvation', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          user: userOne.user.id,
          after: reservationTwo.reservation.id
        };

        const {
          data: { reservations }
        } = await client.query({ query: getReservations, variables });

        expect(reservations.length).toBe(2);
        expect(reservations[0].id).toBe(reservationThree.reservation.id);
      });

      test('OrderBy arg sorts reservations as expected', async () => {
        const client = getClient(userTwo.jwt);

        const variables = {
          listing: listingTwo.listing.id,
          orderBy: 'checkin_DESC'
        };

        const {
          data: { reservations }
        } = await client.query({ query: getReservations, variables });

        expect(reservations.length).toBe(3);

        // Make sure reservations are ordered by descending checkin date
        for (let i = 0; i < reservations.length - 1; i += 1) {
          const current = reservations[i];
          const next = reservations[i + 1];

          expect(new Date(current.checkin).valueOf()).toBeGreaterThan(
            new Date(next.checkin).valueOf()
          );
        }
      });
    });
  });

  describe('Mutations', () => {
    describe('createReservation', () => {
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
        const token = jwt.sign({ userId: 'ahfkjsdsdjkfj' }, jwtSecret);

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

    describe('updateReservation', () => {
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
        const token = jwt.sign({ userId: 'hskjfhsldjkf' }, jwtSecret);

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
          id: reservationTwo.reservation.id,
          data: { ...defaultData, checkin: 'October 7, 2020' }
        };

        await expect(
          client.mutate({ mutation: updateReservation, variables })
        ).rejects.toThrow('Checkin and checkout must be valid ISO strings.');
      });

      test('Error is thrown if checkout is not a valid ISO string', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          id: reservationTwo.reservation.id,
          data: { ...defaultData, checkout: 'October 7, 2020' }
        };

        await expect(
          client.mutate({ mutation: updateReservation, variables })
        ).rejects.toThrow('Checkin and checkout must be valid ISO strings.');
      });

      test("Error is thrown if checkin is before today's date", async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          id: reservationTwo.reservation.id,
          data: {
            ...defaultData,
            checkin: new Date('September 7, 2020').toISOString()
          }
        };

        await expect(
          client.mutate({ mutation: updateReservation, variables })
        ).rejects.toThrow("Checkin cannot be before today's date.");
      });

      test('Error is thrown if checkout is before checkin', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          id: reservationTwo.reservation.id,
          data: {
            ...defaultData,
            checkout: new Date('September 7, 2020').toISOString()
          }
        };

        await expect(
          client.mutate({ mutation: updateReservation, variables })
        ).rejects.toThrow('Checkout cannot be before checkin date.');
      });

      test('Same day checkin and checkout should be allowed', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          id: reservationTwo.reservation.id,
          data: {
            ...defaultData,
            checkout: defaultData.checkin
          }
        };

        await client.mutate({ mutation: updateReservation, variables });
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
        const token = jwt.sign({ userId: 'sjhdfjksdfl' }, jwtSecret);

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
