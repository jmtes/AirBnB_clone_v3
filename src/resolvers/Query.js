import getUserId from './utils/getUserId';

const Query = {
  user: async (_parent, { id }, { prisma }, info) => {
    const user = await prisma.query.user({ where: { id } }, info);

    if (!user) throw Error('User not found.');
    return user;
  },
  me: async (_parent, _args, { req, prisma }, info) => {
    const userId = getUserId(req);

    const user = await prisma.query.user({ where: { id: userId } }, info);

    if (!user) throw Error('User not found.');
    return user;
  }
};

export default Query;
