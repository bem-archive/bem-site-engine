var PATH = require('path'),
    CRYPTO = require('crypto'),
    environ = require('../../.bem/environ'),
    join = PATH.join,
    relative = PATH.relative;

for(var i in environ) exports[i] = environ[i];

var LIB_DIR = exports.LIB_DIR = 'cache',
    LIB_ROOT = exports.LIB_ROOT = join(__dirname, LIB_DIR),

    getLibPath = exports.getLibPath = function() {
        var args = [].slice.call(arguments, 0);
        return join.apply(null, [exports.LIB_ROOT].concat(args));
    },
    getLibRelPath = exports.getLibRelPath = function() {
        return relative(exports.PRJ_ROOT, getLibPath.apply(null, arguments));
    };
