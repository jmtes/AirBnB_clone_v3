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

import { getListing } from './operations/listing';

describe('User', () => {
  const defaultClient = getClient();

  beforeAll(seedDatabase);

  describe('Queries', () => {
    describe('listing', () => {
      test('Error is thrown if listing does not exist', async () => {
        const variables = { id: 'sklfjdsklf' };

        await expect(
          defaultClient.query({ query: getListing, variables })
        ).rejects.toThrow('Listing not found.');
      });

      test('Expected listing is returned', async () => {
        const variables = { id: listingOne.listing.id };

        const {
          data: { listing }
        } = await defaultClient.query({ query: getListing, variables });

        expect(listing.name).toBe(listingOne.listing.name);
      });

      test('Address is hidden if not authenticated', async () => {
        const variables = { id: listingOne.listing.id };

        const {
          data: { listing }
        } = await defaultClient.query({ query: getListing, variables });

        expect(listing.address).toBe(null);
      });

      test('Address is hidden if authenticated but not owner', async () => {
        const client = getClient(userTwo.jwt);

        const variables = { id: listingOne.listing.id };

        const {
          data: { listing }
        } = await client.query({ query: getListing, variables });

        expect(listing.address).toBe(null);
      });

      test('Address is visible if authenticated and owner', async () => {
        const client = getClient(userOne.jwt);

        const variables = { id: listingOne.listing.id };

        const {
          data: { listing }
        } = await client.query({ query: getListing, variables });

        expect(listing.address).toBe(listingOne.listing.address);
      });

      test('Reservations are hidden if not authenticated', async () => {
        const variables = { id: listingOne.listing.id };

        const {
          data: { listing }
        } = await defaultClient.query({ query: getListing, variables });

        expect(listing.reservations).toBe(null);
      });

      test('Reservations are hidden if authenticated but not owner', async () => {
        const client = getClient(userTwo.jwt);

        const variables = { id: listingOne.listing.id };

        const {
          data: { listing }
        } = await client.query({ query: getListing, variables });

        expect(listing.reservations).toBe(null);
      });

      test('Reservations are visible if authenticated and owner', async () => {
        const client = getClient(userOne.jwt);

        const variables = { id: listingOne.listing.id };

        const {
          data: { listing }
        } = await client.query({ query: getListing, variables });

        expect(listing.reservations).toEqual([]);
      });
    });
  });

  describe.skip('Mutations', () => {});
});
