var luster = require('luster'),
    master = require('./master'),
    config = require('../config');

luster.configure({
    app: require.resolve('./worker'),
    workers: config.get('luster:workers'),
    control: config.get('luster:control'),
    server: config.get('luster:server')
}, true, __dirname);

module.exports = luster;
