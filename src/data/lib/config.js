var nconf = require('nconf'),
    path = require('path');

nconf.env();

[
    'current/common',
    'current/data',
    'common/common',
    'common/data'
].forEach(function(item) {
    nconf.add(item,   {
        type: 'file',
        file: path.resolve(process.cwd(), 'configs', (item + '.json'))
    });
});

module.exports = nconf;
