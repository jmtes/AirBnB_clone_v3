import { gql } from 'apollo-boost';

// eslint-disable-next-line import/prefer-default-export
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
