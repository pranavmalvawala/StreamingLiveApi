const { createServer, proxy } = require('aws-serverless-express');
const { init } = require('./dist/app');
const { Pool } = require('./dist/apiBase/pool');

const AWS = require('aws-sdk');

Pool.initPool();

module.exports.universal = function universal(event, context) {
    AWS.config.update({ region: 'us-east-2' });


    init().then(app => {
        const server = createServer(app);
        return proxy(server, event, context);
    });

}