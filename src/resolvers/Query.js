import getUserId from './utils/getUserId';

const Query = {
  users: (
    _parent,
    { query, first, skip, after, orderBy },
    { prisma },
    info
  ) => {
    const opArgs = { first, skip, after, orderBy };

    if (query) opArgs.where = { name_contains: query };

    return prisma.query.users(opArgs, info);
  },
  me: (_parent, _args, { req, prisma }, info) => {
    const userId = getUserId(req);

    return prisma.query.user({ where: { id: userId } }, info);
  }
};

export default Query;
