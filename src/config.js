var nconf = require('nconf'),
    path = require('path'),
    configsDir = path.resolve(__dirname, '../configs');

nconf
    .argv()
    .env()
    .add('common', { type: 'file', file: path.resolve(configsDir, 'common/node.json')})
    .add('current', { type: 'file', file: path.resolve(configsDir, 'current/node.json')});

module.exports = nconf;
