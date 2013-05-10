var PATH = require('path'),
    environ = require('../environ'),

    join = PATH.join,
    resolve = PATH.resolve.bind(null, __dirname),

    PRJ_TECHS = resolve('../techs/'),
    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

exports.getTechs = function() {
    var techs = {
        'bemdecl.js'    : 'bemdecl.js',
        'deps.js'       : 'deps.js',
        'js'            : 'js-i',
        'css'           : 'css',
        'ie.css'        : 'ie.css',
        'ie6.css'       : 'ie6.css',
        'ie7.css'       : 'ie7.css',
        'ie8.css'       : 'ie8.css',
        'ie9.css'       : 'ie9.css'
    };

    ['html', 'bemhtml', 'bemtree.xjst', 'vanilla.js', 'browser.js', 'node.js'].forEach(function(name) {
        techs[name] = join(BEMCORE_TECHS, [name, 'js'].join('.'));
    });

    return techs;
};

exports.defaultTechs = ['css', 'vanilla.js', 'deps.js', 'bemhtml', 'bemtree.xjst'];
