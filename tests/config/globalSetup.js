require('@babel/register');

require('core-js/stable');
require('regenerator-runtime/runtime');

const server = require('../../src/server').default;

module.exports = async () => {
  global.httpServer = await server.start({ port: process.env.PORT });
};
