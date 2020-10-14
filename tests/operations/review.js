import { gql } from 'apollo-boost';

export const getReviews = gql`
  query(
    $author: ID
    $listing: ID
    $rating: Int
    $first: Int
    $skip: Int
    $after: String
    $orderBy: ReviewOrderByInput
  ) {
    reviews(
      author: $author
      listing: $listing
      rating: $rating
      first: $first
      skip: $skip
      after: $after
      orderBy: $orderBy
    ) {
      id
      author {
        id
      }
      listing {
        id
      }
      rating
    }
  }
`;

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

export const updateReview = gql`
  mutation($id: ID!, $data: UpdateReviewInput!) {
    updateReview(id: $id, data: $data) {
      id
      title
      body
    }
  }
`;

export const deleteReview = gql`
  mutation($id: ID!) {
    deleteReview(id: $id) {
      id
      rating
    }
  }
`;
