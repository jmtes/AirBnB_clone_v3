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
      name
      desc
    }
  }
`;

export const updateListing = gql`
  mutation($id: ID!, $data: UpdateListingInput!) {
    updateListing(id: $id, data: $data) {
      id
      name
      desc
      beds
      baths
      maxGuests
      price
      photos
      amenities {
        name
      }
    }
  }
`;
