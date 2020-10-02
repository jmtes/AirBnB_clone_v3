import getUserId from './utils/getUserId';

const Query = {
  user: async (_parent, { id }, { prisma }, info) => {
    const user = await prisma.query.user({ where: { id } }, info);

    if (user) return user;
    throw Error('User not found.');
  },
  me: (_parent, _args, { req, prisma }, info) => {
    const userId = getUserId(req);

    return prisma.query.user({ where: { id: userId } }, info);
  }
};

export default Query;
