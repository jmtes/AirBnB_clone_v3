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
        id
        name
      }
    }
  }
`;

export const updateProfile = gql`
  mutation($data: UpdateUserProfileInput!) {
    updateUserProfile(data: $data) {
      name
      avatar
      bio
    }
  }
`;

export const updateEmail = gql`
  mutation($data: UpdateUserEmailInput!) {
    updateUserEmail(data: $data) {
      email
    }
  }
`;

export const updatePassword = gql`
  mutation($data: UpdateUserPasswordInput!) {
    updateUserPassword(data: $data) {
      id
    }
  }
`;

export const getUser = gql`
  query($id: ID!) {
    user(id: $id) {
      id
      name
      email
      password
      reservations {
        id
      }
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
