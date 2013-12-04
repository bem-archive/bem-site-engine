var PATH = require('path'),
    appRoot = PATH.resolve(__dirname, '../../');

module.exports = {
    static : {
        host : 'http://127.0.0.1:8001'
    },
    datasrc : {
        host : 'http://127.0.0.1:8001/datasrc',
        root : PATH.join(appRoot, 'datasrc')
    }
};
