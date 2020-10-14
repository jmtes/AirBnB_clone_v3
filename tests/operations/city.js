import { gql } from 'apollo-boost';

export const getCities = gql`
  query(
    $query: String
    $first: Int
    $skip: Int
    $after: String
    $orderBy: CityOrderByInput
  ) {
    cities(
      query: $query
      first: $first
      skip: $skip
      after: $after
      orderBy: $orderBy
    ) {
      id
      name
      country
    }
  }
`;

export const getCity = gql`
  query($id: ID!) {
    city(id: $id) {
      id
      name
    }
  }
`;
