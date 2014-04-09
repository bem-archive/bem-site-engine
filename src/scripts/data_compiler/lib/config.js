var nconf = require('nconf'),
    path = require('path'),
    configsDir = path.resolve(process.cwd(), 'configs');

nconf
    .argv({
        "v": {
            alias: 'version',
            describe: 'Snapshot version',
            demand: true,
            default: 'latest'
        }
    })
    .env()
    .add('common', { type: 'file', file: path.resolve(configsDir, 'common/node.json')})
    .add('current', { type: 'file', file: path.resolve(configsDir, 'current/node.json')});

module.exports = nconf;