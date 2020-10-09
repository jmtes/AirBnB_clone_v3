import { gql } from 'apollo-boost';

// eslint-disable-next-line import/prefer-default-export
export const createReview = gql`
  mutation($listingId: ID!, $data: CreateReviewInput!) {
    createReview(listingId: $listingId, data: $data) {
      id
      rating
      title
      body
    }
  }
`;
