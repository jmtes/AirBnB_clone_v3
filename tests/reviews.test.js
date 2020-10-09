import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import jwt from 'jsonwebtoken';

import prisma from '../src/prisma';

import getClient from './utils/getClient';
import seedDatabase, {
  userOne,
  userTwo,
  userThree,
  listingOne,
  listingTwo
} from './utils/seedDatabase';

import { createReview } from './operations/review';

describe('Reviews', () => {
  const defaultClient = getClient();

  beforeAll(seedDatabase);

  describe('Mutations', () => {
    describe('createReview', () => {
      const defaultData = {
        rating: 5,
        title: 'Had a lovely stay',
        body:
          'The place was beautifully decorated and had everything we needed to feel at home, not to mention the view outside was breathtaking! Would definitely book again!'
      };
      // Authentication
      test('Error is thrown if not authenticated', async () => {
        const variables = {
          listingId: listingOne.listing.id,
          data: { ...defaultData }
        };

        await expect(
          defaultClient.mutate({ mutation: createReview, variables })
        ).rejects.toThrow('Authentication required.');
      });

      test('Error is thrown if user account does not exist', async () => {
        const token = jwt.sign({ userId: 'jkshdkjds' }, process.env.JWT_SECRET);

        const client = getClient(token);

        const variables = {
          listingId: listingOne.listing.id,
          data: { ...defaultData }
        };

        await expect(
          client.mutate({ mutation: createReview, variables })
        ).rejects.toThrow('User account does not exist.');
      });

      test('Error is thrown if listing does not exist', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          listingId: 'jsdlkfhsdfsdlk',
          data: { ...defaultData }
        };

        await expect(
          client.mutate({ mutation: createReview, variables })
        ).rejects.toThrow('Listing does not exist.');
      });

      test('Error is thrown if user is listing owner', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          listingId: listingOne.listing.id,
          data: { ...defaultData }
        };

        await expect(
          client.mutate({ mutation: createReview, variables })
        ).rejects.toThrow('Cannot write a review for your own listing.');
      });

      test('Error is thrown if user has already written a review for the listing', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          listingId: listingTwo.listing.id,
          data: { ...defaultData }
        };

        await expect(
          client.mutate({ mutation: createReview, variables })
        ).rejects.toThrow('Cannot write multiple reviews for one place.');
      });

      // DB Changes
      test('New review is added to the DB', async () => {
        const client = getClient(userThree.jwt);

        const variables = {
          listingId: listingOne.listing.id,
          data: { ...defaultData }
        };

        const {
          data: {
            createReview: { id, rating, title, body }
          }
        } = await client.mutate({ mutation: createReview, variables });

        // Make sure returned values match input
        expect(rating).toBe(defaultData.rating);
        expect(title).toBe(defaultData.title);
        expect(body).toBe(defaultData.body);

        // Make sure review exists in DB
        const reviewExists = await prisma.exists.Review({
          id,
          rating,
          title,
          body,
          author: { id: userThree.user.id },
          listing: { id: listingOne.listing.id }
        });
        expect(reviewExists).toBe(true);
      });

      // Input Validation
      test('Error is thrown if rating is less than 1', async () => {
        const client = getClient(userThree.jwt);

        const variables = {
          listingId: listingTwo.listing.id,
          data: { ...defaultData, rating: 0 }
        };

        await expect(
          client.mutate({ mutation: createReview, variables })
        ).rejects.toThrow('Rating must be on a scale between 1 and 5.');
      });

      // Input Sanitization
    });
  });
});
