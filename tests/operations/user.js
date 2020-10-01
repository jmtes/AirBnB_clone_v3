import { gql } from 'apollo-boost';

export const createUser = gql`
  mutation($data: CreateUserInput!) {
    createUser(data: $data) {
      token
      user {
        id
        name
      }
    }
  }
`;

export const loginUser = gql`
  mutation($data: LoginUserInput!) {
    loginUser(data: $data) {
      token
      user {
        name
      }
    }
  }
`;

export const getUsers = gql`
  query {
    users {
      id
      name
      email
    }
  }
`;

export const getMe = gql`
  query {
    me {
      email
    }
  }
`;
