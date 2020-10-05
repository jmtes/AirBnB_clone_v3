import { gql } from 'apollo-boost';

// eslint-disable-next-line import/prefer-default-export
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
