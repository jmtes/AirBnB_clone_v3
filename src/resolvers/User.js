import getUserId from './utils/getUserId';

const User = {
  email: {
    fragment: 'fragment userId on User { id }',
    resolve: (parent, _args, { req }) => {
      const userId = getUserId(req, false);

      if (userId && userId === parent.id) return parent.email;
      return null;
    }
  },
  password: () => {
    return null;
  },
  reservations: {
    fragment: 'fragment userId on User { id }',
    resolve: (parent, _args, { req }) => {
      const userId = getUserId(req, false);

      if (userId && userId === parent.id) return parent.reservations;
      return null;
    }
  }
};

export default User;
