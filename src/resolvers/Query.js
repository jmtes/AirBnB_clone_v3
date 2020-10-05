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
  },
  cities: (
    _parent,
    { query, first, skip, after, orderBy },
    { prisma },
    info
  ) => {
    const opArgs = { first, skip, after, orderBy };

    if (query)
      opArgs.where = {
        OR: [
          { name_contains: query },
          { state_contains: query },
          { region_contains: query },
          { country_contains: query }
        ]
      };

    return prisma.query.cities(opArgs, info);
  },
  city: async (_parent, { id }, { prisma }, info) => {
    const city = await prisma.query.city({ where: { id } }, info);
    if (!city) throw Error('City not found.');

    return city;
  }
};

export default Query;
