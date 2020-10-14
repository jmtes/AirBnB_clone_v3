import { GraphQLServer } from 'graphql-yoga';

import { resolvers, fragmentReplacements } from './resolvers';
import prisma from './prisma';

// Initialize server
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: (req) => ({ req, prisma }),
  fragmentReplacements,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
});

export default server;
