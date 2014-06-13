var nconf = require('nconf'),
    path = require('path');

nconf
    .argv({
        "v": {
            alias: 'version',
            describe: 'Snapshot version',
            demand: true,
            default: 'latest'
        }
    })
    .env();

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
