var nconf = require('nconf'),
    PATH = require('path');

nconf.argv()
    .env()
    .file({ file: PATH.join(__dirname, '..', 'configs', 'current', 'node.json') });

module.exports = nconf;
