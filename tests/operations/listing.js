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

export const getListings = gql`
  query(
    $owner: ID
    $city: ID
    $amenities: [AmenityName!]
    $beds: Int
    $baths: Int
    $guests: Int
    $price: Float
    $rating: Float
    $first: Int
    $skip: Int
    $after: String
    $orderBy: ListingOrderByInput
  ) {
    listings(
      owner: $owner
      city: $city
      amenities: $amenities
      beds: $beds
      baths: $baths
      guests: $guests
      price: $price
      rating: $rating
      first: $first
      skip: $skip
      after: $after
      orderBy: $orderBy
    ) {
      id
      owner {
        id
      }
      city {
        id
      }
      amenities {
        name
      }
      beds
      baths
      maxGuests
      price
      rating
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

export const deleteListing = gql`
  mutation($id: ID!) {
    deleteListing(id: $id) {
      id
    }
  }
`;
