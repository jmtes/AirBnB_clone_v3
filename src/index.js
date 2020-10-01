import 'core-js/stable';
import 'regenerator-runtime/runtime';

import server from './server';

// Start server
server.start({ port: process.env.PORT }, () => {
  console.log(`Server listening on Port ${process.env.PORT}`);
});
