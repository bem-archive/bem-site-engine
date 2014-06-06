var nconf = require('nconf'),
    path = require('path');

nconf
    .argv()
    .env();

[
    'current/common',
    'current/app',
    'common/common',
    'common/app'
].forEach(function(item) {
    nconf.add(item,   {
        type: 'file',
        file: path.resolve(process.cwd(), 'configs', (item + '.json'))
    });
});

module.exports = nconf;
