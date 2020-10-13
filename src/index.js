import 'core-js/stable';
import 'regenerator-runtime/runtime';

import server from './server';
import { port } from '../config';

// Start server
server.start({ port }, () => {
  console.log(`Server listening on Port ${port}`);
});
