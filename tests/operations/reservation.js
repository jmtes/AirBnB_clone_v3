import { gql } from 'apollo-boost';

// eslint-disable-next-line import/prefer-default-export
export const createReservation = gql`
  mutation($listingId: ID!, $data: CreateReservationInput) {
    createReservation(listingId: $listingId, data: $data) {
      id
    }
  }
`;
