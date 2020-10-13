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
  listingTwo,
  listingThree,
  reviewOne,
  reviewTwo
} from './utils/seedDatabase';

import {
  getReviews,
  createReview,
  updateReview,
  deleteReview
} from './operations/review';

import { jwtSecret } from '../config';

describe('Reviews', () => {
  const defaultClient = getClient();

  beforeAll(seedDatabase);

  describe('Queries', () => {
    describe('reviews', () => {
      test('Gets all reviews from DB with no args', async () => {
        const {
          data: { reviews }
        } = await defaultClient.query({ query: getReviews });

        expect(reviews.length).toBe(2);
      });

      test('Author arg filters out reviews that were not written by specified user', async () => {
        const variables = { author: userOne.user.id };

        const {
          data: { reviews }
        } = await defaultClient.query({ query: getReviews, variables });

        expect(reviews.length).toBe(1);

        const allWrittenByCorrectAuthor = reviews.every(
          (review) => review.author.id === userOne.user.id
        );
        expect(allWrittenByCorrectAuthor).toBe(true);
      });

      test('Listing arg filters out reviews that were not written for specified listing', async () => {
        const variables = { listing: listingOne.listing.id };

        const {
          data: { reviews }
        } = await defaultClient.query({ query: getReviews, variables });

        expect(reviews.length).toBe(1);

        const allForCorrectListing = reviews.every(
          (review) => review.listing.id === listingOne.listing.id
        );
        expect(allForCorrectListing).toBe(true);
      });

      test('Rating arg filters out reviews that do not have the specified rating', async () => {
        const variables = { rating: 5 };

        const {
          data: { reviews }
        } = await defaultClient.query({ query: getReviews, variables });

        expect(reviews.length).toBe(1);

        const allRaveReviews = reviews.every((review) => review.rating === 5);
        expect(allRaveReviews).toBe(true);
      });

      test('First arg gets only first n reviews', async () => {
        const variables = { first: 1 };

        const {
          data: { reviews }
        } = await defaultClient.query({ query: getReviews, variables });

        expect(reviews.length).toBe(1);
        expect(reviews[0].id).toBe(reviewOne.review.id);
      });

      test('Skip arg skips first n reviews', async () => {
        const variables = { skip: 1 };

        const {
          data: { reviews }
        } = await defaultClient.query({ query: getReviews, variables });

        expect(reviews.length).toBe(1);
        expect(reviews[0].id).toBe(reviewTwo.review.id);
      });

      test('After arg only gets reviews after specified review', async () => {
        const variables = { after: reviewOne.review.id };

        const {
          data: { reviews }
        } = await defaultClient.query({ query: getReviews, variables });

        expect(reviews.length).toBe(1);
        expect(reviews[0].id).toBe(reviewTwo.review.id);
      });

      test('OrderBy arg sorts reviews as expected', async () => {
        const variables = { orderBy: 'rating_ASC' };

        const {
          data: { reviews }
        } = await defaultClient.query({ query: getReviews, variables });

        expect(reviews.length).toBe(2);

        // Make sure reviews are sorted by ascending rating
        for (let i = 0; i < reviews.length - 1; i += 1) {
          const current = reviews[i];
          const next = reviews[i + 1];

          expect(current.rating).toBeLessThanOrEqual(next.rating);
        }
      });
    });
  });

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
        const token = jwt.sign({ userId: 'jkshdkjds' }, jwtSecret);

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

        // Remove review and reset listing rating
        await prisma.mutation.deleteReview({ where: { id } });
        await prisma.mutation.updateListing({
          where: { id: listingOne.listing.id },
          data: {
            ratingSum: listingOne.input.ratingSum,
            reviewCount: listingOne.input.reviewCount,
            rating: listingOne.input.rating
          }
        });
      });

      test('Listing rating is updated (no prior reviews)', async () => {
        const client = getClient(userThree.jwt);

        const variables = {
          listingId: listingThree.listing.id,
          data: { ...defaultData }
        };

        const listingBefore = await prisma.query.listing(
          { where: { id: listingThree.listing.id } },
          '{ ratingSum reviewCount rating }'
        );

        expect(listingBefore.ratingSum).toBe(0);
        expect(listingBefore.reviewCount).toBe(0);
        expect(listingBefore.rating).toBe(0);

        const {
          data: {
            createReview: { id }
          }
        } = await client.mutate({ mutation: createReview, variables });

        const listingAfter = await prisma.query.listing(
          { where: { id: listingThree.listing.id } },
          '{ ratingSum reviewCount rating }'
        );

        expect(listingAfter.ratingSum).toBe(defaultData.rating);
        expect(listingAfter.reviewCount).toBe(1);
        expect(listingAfter.rating).toBe(defaultData.rating);

        // Remove review and reset listing rating
        await prisma.mutation.deleteReview({ where: { id } });
        await prisma.mutation.updateListing({
          where: { id: listingThree.listing.id },
          data: {
            ratingSum: listingThree.input.ratingSum,
            reviewCount: listingThree.input.reviewCount,
            rating: listingThree.input.rating
          }
        });
      });

      test('Listing rating is updated (existing reviews)', async () => {
        const client = getClient(userThree.jwt);

        const variables = {
          listingId: listingTwo.listing.id,
          data: { ...defaultData }
        };

        let listing = await prisma.query.listing(
          { where: { id: listingTwo.listing.id } },
          '{ ratingSum reviewCount rating }'
        );

        const oldSum = listing.ratingSum;
        const oldCount = listing.reviewCount;

        const {
          data: {
            createReview: { id, rating }
          }
        } = await client.mutate({ mutation: createReview, variables });

        listing = await prisma.query.listing(
          { where: { id: listingTwo.listing.id } },
          '{ ratingSum reviewCount rating }'
        );

        const newSum = listing.ratingSum;
        const newCount = listing.reviewCount;
        const newRating = listing.rating;

        expect(newSum).toBe(oldSum + rating);
        expect(newCount).toBe(oldCount + 1);
        expect(newRating).toBe(parseInt((newSum / newCount).toFixed(2), 10));

        // Remove review and reset listing rating
        await prisma.mutation.deleteReview({ where: { id } });
        await prisma.mutation.updateListing({
          where: { id: listingTwo.listing.id },
          data: {
            ratingSum: listingTwo.input.ratingSum,
            reviewCount: listingTwo.input.reviewCount,
            rating: listingTwo.input.rating
          }
        });
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

      test('Error is thrown if rating is greater than 5', async () => {
        const client = getClient(userThree.jwt);

        const variables = {
          listingId: listingTwo.listing.id,
          data: { ...defaultData, rating: 6 }
        };

        await expect(
          client.mutate({ mutation: createReview, variables })
        ).rejects.toThrow('Rating must be on a scale between 1 and 5.');
      });

      test('Error is thrown if title is too long', async () => {
        const client = getClient(userThree.jwt);

        const variables = {
          listingId: listingTwo.listing.id,
          data: {
            ...defaultData,
            title:
              'Oh man this was such a good place to stay. It was sucha  lovely place. I had a wonderful time. Man!'
          }
        };

        await expect(
          client.mutate({ mutation: createReview, variables })
        ).rejects.toThrow('Title may not exceed 50 characters.');
      });

      test('Empty title should be allowed', async () => {
        const client = getClient(userThree.jwt);

        const variables = {
          listingId: listingTwo.listing.id,
          data: {
            ...defaultData,
            title: ''
          }
        };

        const {
          data: {
            createReview: { id }
          }
        } = await client.mutate({ mutation: createReview, variables });

        // Remove review and reset listing rating
        await prisma.mutation.deleteReview({ where: { id } });
        await prisma.mutation.updateListing({
          where: { id: listingTwo.listing.id },
          data: {
            ratingSum: listingTwo.input.ratingSum,
            reviewCount: listingTwo.input.reviewCount,
            rating: listingTwo.input.rating
          }
        });
      });

      test('Error is thrown if body exceeds 250 words', async () => {
        const client = getClient(userThree.jwt);

        const variables = {
          listingId: listingTwo.listing.id,
          data: {
            ...defaultData,
            body: `
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla efficitur ex a euismod blandit. Etiam semper bibendum tellus eget scelerisque. Aliquam accumsan porta iaculis. Aliquam non eros quam. Proin porta lacus lectus, vestibulum finibus arcu fringilla et. Duis interdum ante nec est mattis pellentesque. Vestibulum eleifend libero et arcu efficitur cursus. Cras et ornare elit, sed consectetur massa. Nulla tempus felis augue. Vivamus sit amet elementum lectus. Aenean diam sem, bibendum vitae vestibulum eu, tempor et nisi. Suspendisse egestas diam vel velit maximus suscipit. Fusce eleifend iaculis velit, quis porta nisi. Sed justo velit, viverra id lectus eu, posuere maximus neque. Maecenas lacus risus, fermentum ornare velit id, pharetra faucibus elit.

            Morbi sed malesuada sapien, id iaculis arcu. Suspendisse a quam dignissim, venenatis lectus sit amet, porttitor lectus. Aliquam erat volutpat. Donec aliquet nisl id sem vehicula, sed facilisis velit sodales. Nunc fringilla tortor eget ante consectetur tempus. In rutrum, lectus tincidunt interdum auctor, mauris erat tempus augue, eu ornare diam dui non massa. Nulla ut quam eu neque vulputate aliquet non pulvinar turpis. Aenean dictum quam non suscipit suscipit.

            Praesent ut faucibus elit, eget feugiat ante. Pellentesque ac tortor augue. Vivamus dignissim dolor id quam maximus gravida. Sed accumsan tellus et euismod auctor. Sed eget nisi id erat malesuada viverra. Praesent tellus quam, aliquet nec pulvinar quis, condimentum sit amet sapien. Praesent euismod a est sed tempor. Ut malesuada enim ut ipsum sollicitudin, tincidunt accumsan nunc commodo. Nunc at magna viverra, dapibus quam sit amet, fermentum quam. Quisque felis magna.
            `
          }
        };

        await expect(
          client.mutate({ mutation: createReview, variables })
        ).rejects.toThrow('Body may not exceed 250 words.');
      });

      test('Empty body should be allowed', async () => {
        const client = getClient(userThree.jwt);

        const variables = {
          listingId: listingTwo.listing.id,
          data: {
            ...defaultData,
            body: ''
          }
        };

        const {
          data: {
            createReview: { id }
          }
        } = await client.mutate({ mutation: createReview, variables });

        // Remove review and reset listing rating
        await prisma.mutation.deleteReview({ where: { id } });
        await prisma.mutation.updateListing({
          where: { id: listingTwo.listing.id },
          data: {
            ratingSum: listingTwo.input.ratingSum,
            reviewCount: listingTwo.input.reviewCount,
            rating: listingTwo.input.rating
          }
        });
      });

      // Input Sanitization
      test('Title should be sanitized', async () => {
        const client = getClient(userThree.jwt);

        const variables = {
          listingId: listingTwo.listing.id,
          data: {
            ...defaultData,
            title: '    Wonderful stay <3     '
          }
        };

        const {
          data: {
            createReview: { id, title }
          }
        } = await client.mutate({ mutation: createReview, variables });

        expect(title).toBe('Wonderful stay &lt;3');

        // Remove review and reset listing rating
        await prisma.mutation.deleteReview({ where: { id } });
        await prisma.mutation.updateListing({
          where: { id: listingTwo.listing.id },
          data: {
            ratingSum: listingTwo.input.ratingSum,
            reviewCount: listingTwo.input.reviewCount,
            rating: listingTwo.input.rating
          }
        });
      });

      test('Body should be sanitized', async () => {
        const client = getClient(userThree.jwt);

        const variables = {
          listingId: listingTwo.listing.id,
          data: {
            ...defaultData,
            body: '    Wonderful stay <3     '
          }
        };

        const {
          data: {
            createReview: { id, body }
          }
        } = await client.mutate({ mutation: createReview, variables });

        expect(body).toBe('Wonderful stay &lt;3');

        // Remove review and reset listing rating
        await prisma.mutation.deleteReview({ where: { id } });
        await prisma.mutation.updateListing({
          where: { id: listingTwo.listing.id },
          data: {
            ratingSum: listingTwo.input.ratingSum,
            reviewCount: listingTwo.input.reviewCount,
            rating: listingTwo.input.rating
          }
        });
      });
    });

    describe('updateReview', () => {
      const defaultData = {
        title: 'Nice stay',
        body:
          'The place was beautifully decorated, not to mention the view outside was breathtaking! It could use a little renovation, though.'
      };

      // Authentication
      test('Error is thrown if not authenticated', async () => {
        const variables = { id: reviewOne.review.id, data: { ...defaultData } };

        await expect(
          defaultClient.mutate({ mutation: updateReview, variables })
        ).rejects.toThrow('Authentication required.');
      });

      test('Error is thrown if user account does not exist', async () => {
        const token = jwt.sign({ userId: 'sklajfldskjfkdsl' }, jwtSecret);

        const client = getClient(token);

        const variables = { id: reviewOne.review.id, data: { ...defaultData } };

        await expect(
          client.mutate({ mutation: updateReview, variables })
        ).rejects.toThrow('User account does not exist.');
      });

      test('Error is thrown if review does not exist', async () => {
        const client = getClient(userTwo.jwt);

        const variables = { id: 'skldfjldsk', data: { ...defaultData } };

        await expect(
          client.mutate({ mutation: updateReview, variables })
        ).rejects.toThrow('Unable to edit review');
      });

      test('Error is thrown if user is not review author', async () => {
        const client = getClient(userOne.jwt);

        const variables = { id: reviewOne.review.id, data: { ...defaultData } };

        await expect(
          client.mutate({ mutation: updateReview, variables })
        ).rejects.toThrow('Unable to edit review.');
      });

      // DB Changes
      test('Changes are reflected in the DB', async () => {
        const client = getClient(userTwo.jwt);

        const variables = { id: reviewOne.review.id, data: { ...defaultData } };

        const {
          data: {
            updateReview: { id, title, body }
          }
        } = await client.mutate({ mutation: updateReview, variables });

        // Check returned values
        expect(id).toBe(reviewOne.review.id);
        expect(title).toBe(defaultData.title);
        expect(body).toBe(defaultData.body);

        const wasUpdatedInDB = await prisma.exists.Review({ id, title, body });
        expect(wasUpdatedInDB).toBe(true);
      });

      test('Listing rating should not change if data does not contain rating', async () => {
        const client = getClient(userTwo.jwt);

        const variables = { id: reviewOne.review.id, data: { ...defaultData } };

        let review = await prisma.query.review(
          { where: { id: reviewOne.review.id } },
          '{ listing { id rating } }'
        );

        const oldRating = review.listing.rating;

        await client.mutate({ mutation: updateReview, variables });

        review = await prisma.query.review(
          { where: { id: reviewOne.review.id } },
          '{ listing { id rating } }'
        );

        const newRating = review.listing.rating;

        expect(newRating).toEqual(oldRating);
      });

      test('Listing rating should not change if rating is the same', async () => {
        const client = getClient(userTwo.jwt);

        const variables = {
          id: reviewOne.review.id,
          data: { ...defaultData, rating: reviewOne.input.rating }
        };

        let review = await prisma.query.review(
          { where: { id: reviewOne.review.id } },
          '{ listing { id rating } }'
        );

        const oldRating = review.listing.rating;

        await client.mutate({ mutation: updateReview, variables });

        review = await prisma.query.review(
          { where: { id: reviewOne.review.id } },
          '{ listing { id rating } }'
        );

        const newRating = review.listing.rating;

        expect(newRating).toEqual(oldRating);
      });

      test('Listing rating should increase if new rating is higher than original', async () => {
        const client = getClient(userOne.jwt);

        const variables = {
          id: reviewTwo.review.id,
          data: { ...defaultData, rating: reviewTwo.input.rating + 1 }
        };

        let review = await prisma.query.review(
          { where: { id: reviewTwo.review.id } },
          '{ listing { id rating } }'
        );

        const oldRating = review.listing.rating;

        await client.mutate({ mutation: updateReview, variables });

        review = await prisma.query.review(
          { where: { id: reviewTwo.review.id } },
          '{ listing { id rating } }'
        );

        const newRating = review.listing.rating;

        expect(newRating).toBeGreaterThan(oldRating);
      });

      test('Listing rating should decrease if new rating is lower than original', async () => {
        const client = getClient(userTwo.jwt);

        const variables = {
          id: reviewOne.review.id,
          data: { ...defaultData, rating: reviewOne.input.rating - 1 }
        };

        let review = await prisma.query.review(
          { where: { id: reviewOne.review.id } },
          '{ listing { id rating } }'
        );

        const oldRating = review.listing.rating;

        await client.mutate({ mutation: updateReview, variables });

        review = await prisma.query.review(
          { where: { id: reviewOne.review.id } },
          '{ listing { id rating } }'
        );

        const newRating = review.listing.rating;

        expect(newRating).toBeLessThan(oldRating);
      });

      // Input Validation
      test('Error is thrown if rating is less than 1', async () => {
        const client = getClient(userTwo.jwt);

        const variables = { id: reviewOne.review.id, data: { rating: 0 } };

        await expect(
          client.mutate({ mutation: updateReview, variables })
        ).rejects.toThrow('Rating must be on a scale between 1 and 5.');
      });

      test('Error is thrown if rating is greater than 5', async () => {
        const client = getClient(userTwo.jwt);

        const variables = { id: reviewOne.review.id, data: { rating: 6 } };

        await expect(
          client.mutate({ mutation: updateReview, variables })
        ).rejects.toThrow('Rating must be on a scale between 1 and 5.');
      });

      test('Error is thrown if title is too long', async () => {
        const client = getClient(userTwo.jwt);

        const variables = {
          id: reviewOne.review.id,
          data: {
            ...defaultData,
            title:
              'Oh man this was such a good place to stay. It was sucha  lovely place. I had a wonderful time. Man!'
          }
        };

        await expect(
          client.mutate({ mutation: updateReview, variables })
        ).rejects.toThrow('Title may not exceed 50 characters.');
      });

      test('Empty title should be allowed', async () => {
        const client = getClient(userTwo.jwt);

        const variables = {
          id: reviewOne.review.id,
          data: {
            ...defaultData,
            title: ''
          }
        };

        await client.mutate({ mutation: updateReview, variables });
      });

      test('Error is thrown if body exceeds 250 words', async () => {
        const client = getClient(userTwo.jwt);

        const variables = {
          id: reviewOne.review.id,
          data: {
            ...defaultData,
            body: `
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla efficitur ex a euismod blandit. Etiam semper bibendum tellus eget scelerisque. Aliquam accumsan porta iaculis. Aliquam non eros quam. Proin porta lacus lectus, vestibulum finibus arcu fringilla et. Duis interdum ante nec est mattis pellentesque. Vestibulum eleifend libero et arcu efficitur cursus. Cras et ornare elit, sed consectetur massa. Nulla tempus felis augue. Vivamus sit amet elementum lectus. Aenean diam sem, bibendum vitae vestibulum eu, tempor et nisi. Suspendisse egestas diam vel velit maximus suscipit. Fusce eleifend iaculis velit, quis porta nisi. Sed justo velit, viverra id lectus eu, posuere maximus neque. Maecenas lacus risus, fermentum ornare velit id, pharetra faucibus elit.

            Morbi sed malesuada sapien, id iaculis arcu. Suspendisse a quam dignissim, venenatis lectus sit amet, porttitor lectus. Aliquam erat volutpat. Donec aliquet nisl id sem vehicula, sed facilisis velit sodales. Nunc fringilla tortor eget ante consectetur tempus. In rutrum, lectus tincidunt interdum auctor, mauris erat tempus augue, eu ornare diam dui non massa. Nulla ut quam eu neque vulputate aliquet non pulvinar turpis. Aenean dictum quam non suscipit suscipit.

            Praesent ut faucibus elit, eget feugiat ante. Pellentesque ac tortor augue. Vivamus dignissim dolor id quam maximus gravida. Sed accumsan tellus et euismod auctor. Sed eget nisi id erat malesuada viverra. Praesent tellus quam, aliquet nec pulvinar quis, condimentum sit amet sapien. Praesent euismod a est sed tempor. Ut malesuada enim ut ipsum sollicitudin, tincidunt accumsan nunc commodo. Nunc at magna viverra, dapibus quam sit amet, fermentum quam. Quisque felis magna.
            `
          }
        };

        await expect(
          client.mutate({ mutation: updateReview, variables })
        ).rejects.toThrow('Body may not exceed 250 words.');
      });

      test('Empty body should be allowed', async () => {
        const client = getClient(userTwo.jwt);

        const variables = {
          id: reviewOne.review.id,
          data: {
            ...defaultData,
            body: ''
          }
        };

        await client.mutate({ mutation: updateReview, variables });
      });

      // Input Sanitization
      test('Title should be sanitized', async () => {
        const client = getClient(userTwo.jwt);

        const variables = {
          id: reviewOne.review.id,
          data: {
            ...defaultData,
            title: '    Wonderful stay <3     '
          }
        };

        const {
          data: {
            updateReview: { title }
          }
        } = await client.mutate({ mutation: updateReview, variables });

        expect(title).toBe('Wonderful stay &lt;3');
      });

      test('Body should be sanitized', async () => {
        const client = getClient(userTwo.jwt);

        const variables = {
          id: reviewOne.review.id,
          data: {
            ...defaultData,
            body: '    Wonderful stay <3     '
          }
        };

        const {
          data: {
            updateReview: { body }
          }
        } = await client.mutate({ mutation: updateReview, variables });

        expect(body).toBe('Wonderful stay &lt;3');
      });
    });

    describe('deleteReview', () => {
      // Authentication
      test('Error is thrown if user is not authenticated', async () => {
        const variables = { id: reviewTwo.review.id };

        await expect(
          defaultClient.mutate({ mutation: deleteReview, variables })
        ).rejects.toThrow('Authentication required.');
      });

      test('Error is thrown if user account does not exist', async () => {
        const token = jwt.sign({ userId: 'hasdjkfhsdjklf' }, jwtSecret);

        const client = getClient(token);

        const variables = { id: reviewTwo.review.id };

        await expect(
          client.mutate({ mutation: deleteReview, variables })
        ).rejects.toThrow('User account does not exist.');
      });

      test('Error is thrown if review does not exist', async () => {
        const client = getClient(userOne.jwt);

        const variables = { id: 'jaslkfsah' };

        await expect(
          client.mutate({ mutation: deleteReview, variables })
        ).rejects.toThrow('Unable to delete review.');
      });

      test('Error is thrown if user is not review author', async () => {
        const client = getClient(userThree.jwt);

        const variables = { id: reviewTwo.review.id };

        await expect(
          client.mutate({ mutation: deleteReview, variables })
        ).rejects.toThrow('Unable to delete review.');
      });

      // DB Changes
      test('Review is removed from DB and listing rating is updated', async () => {
        const client = getClient(userOne.jwt);

        const variables = { id: reviewTwo.review.id };

        // Preserve old listing values
        let listing = await prisma.query.listing(
          { where: { id: listingTwo.listing.id } },
          '{ ratingSum reviewCount rating }'
        );

        const oldSum = listing.ratingSum;
        const oldCount = listing.reviewCount;

        // Delete review from client
        const {
          data: {
            deleteReview: { id, rating }
          }
        } = await client.mutate({ mutation: deleteReview, variables });

        // Make sure review was deleted
        const reviewStillExists = await prisma.exists.Review({ id });
        expect(reviewStillExists).toBe(false);

        // Ensure listing rating was changed as expected
        listing = await prisma.query.listing(
          { where: { id: listingTwo.listing.id } },
          '{ ratingSum reviewCount rating }'
        );

        const newSum = listing.ratingSum;
        const newCount = listing.reviewCount;
        const newRating = listing.rating;

        expect(newSum).toBe(oldSum - rating);
        expect(newCount).toBe(oldCount - 1);
        expect(newRating).toBe(
          newCount ? parseInt((newSum / newCount).toFixed(2), 10) : 0
        );
      });
    });
  });
});
