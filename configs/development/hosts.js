var PATH = require('path'),
    appRoot = PATH.resolve(__dirname, '../../');

module.exports = {
    static : {
        host : ''
    },
    datasrc : {
        host : '/datasrc',
        root : PATH.join(appRoot, 'datasrc')
    }
};
