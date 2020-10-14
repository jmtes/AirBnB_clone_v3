import getUserId from './utils/getUserId';

const Listing = {
  address: {
    fragment: 'fragment ownerId on Listing { owner { id } }',
    resolve: (parent, _args, { req }) => {
      const userId = getUserId(req, false);

      if (userId && userId === parent.owner.id) return parent.address;
      return null;
    }
  },
  reservations: {
    fragment: 'fragment ownerId on Listing { owner { id } }',
    resolve: (parent, _args, { req }) => {
      const userId = getUserId(req, false);

      if (userId && userId === parent.owner.id) return parent.reservations;
      return null;
    }
  }
};

export default Listing;
