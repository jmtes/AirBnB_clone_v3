import { Prisma } from 'prisma-binding';

import { fragmentReplacements } from './resolvers';

import { prismaEndpoint, prismaSecret } from '../config';

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: prismaEndpoint,
  secret: prismaSecret,
  fragmentReplacements
});

export default prisma;
