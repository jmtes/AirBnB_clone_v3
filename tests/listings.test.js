import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import jwt from 'jsonwebtoken';

import prisma from '../src/prisma';

import getClient from './utils/getClient';
import seedDatabase, { listingOne, listingTwo } from './utils/seedDatabase';

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
    });
  });

  describe.skip('Mutations', () => {});
});
