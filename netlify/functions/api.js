const serverless = require('serverless-http');
const app = require('../../backend/server');

// Export the serverless handler
module.exports.handler = serverless(app);