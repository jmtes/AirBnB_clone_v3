import { gql } from 'apollo-boost';

export const getListing = gql`
  query($id: ID!) {
    listing(id: $id) {
      id
      name
      address
      reservations {
        id
      }
    }
  }
`;

export const createListing = gql`
  mutation($data: CreateListingInput!) {
    createListing(data: $data) {
      id
    }
  }
`;
