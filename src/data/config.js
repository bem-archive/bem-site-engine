var nconf = require('nconf'),
    path = require('path');

nconf.env();

['current/app', 'common/app'].forEach(function(item) {
    nconf.add(item,   {
        type: 'file',
        file: path.resolve(process.cwd(), 'configs', (item + '.json'))
    });
});

module.exports = nconf;
