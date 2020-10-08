import { gql } from 'apollo-boost';

export const createReservation = gql`
  mutation($listingId: ID!, $data: CreateReservationInput!) {
    createReservation(listingId: $listingId, data: $data) {
      id
    }
  }
`;

export const updateReservation = gql`
  mutation($id: ID!, $data: UpdateReservationInput!) {
    updateReservation(id: $id, data: $data) {
      id
      checkin
      checkout
    }
  }
`;

export const deleteReservation = gql`
  mutation($id: ID!) {
    deleteReservation(id: $id) {
      id
    }
  }
`;
