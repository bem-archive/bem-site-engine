var nconf = require('nconf'),
    path = require('path'),
    configsDir = path.resolve(process.cwd(), 'configs');

nconf
    .argv()
    .env();

['common/common', 'common/app', 'current/common', 'current/app'].forEach(function(item) {
    nconf.add(item,   { type: 'file', file: path.resolve(configsDir, (item + '.json')) });
});

module.exports = nconf;
