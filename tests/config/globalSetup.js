require('@babel/register');

require('core-js/stable');
require('regenerator-runtime/runtime');

const server = require('../../src/server').default;
const { port } = require('./index');

module.exports = async () => {
  global.httpServer = await server.start({ port });
};
