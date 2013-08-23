var PATH = require('path'),
    environ = require('bem-environ'),

    join = PATH.join,

    LEGO_TECHS = environ.getLibPath('romochka', 'tools/bem/techs/nodejs'),
    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

function resolveTechs(registry, prefix) {
    return function(name) {
        return registry[name] = join(prefix, name + '.js');
    };
}

exports.getTechs = function() {
    var techs = {
        'bemdecl.js' : 'v2/bemdecl.js',
        'deps.js' : 'v2/deps.js',
        'js' : 'js-i',
        'css' : 'v2/css',
        'ie.css'  : 'v2/ie.css',
        'ie6.css' : 'v2/ie6.css',
        'ie7.css' : 'v2/ie7.css',
        'ie8.css' : 'v2/ie8.css',
        'ie9.css' : 'v2/ie9.css'
    };

    [
        'html',
        'bemhtml',
        'bemtree',
        'vanilla.js',
        'browser.js',
        'node.js'
    ].forEach(resolveTechs(techs, BEMCORE_TECHS));

    [
        'i18n',
        'i18n.keys.js'
    ].forEach(resolveTechs(techs, LEGO_TECHS));

    return techs;
};

exports.defaultTechs = ['css', 'vanilla.js', 'deps.js', 'bemhtml', 'bemtree'];
