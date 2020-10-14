import { extractFragmentReplacements } from 'prisma-binding';

import Query from './Query';
import Mutation from './Mutation';
// import Subscription from './Subscription';
import User from './User';
import Listing from './Listing';

export const resolvers = {
  Query,
  Mutation,
  // Subscription,
  User,
  Listing
};

export const fragmentReplacements = extractFragmentReplacements(resolvers);
