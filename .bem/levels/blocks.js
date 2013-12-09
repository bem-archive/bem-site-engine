var PATH = require('path'),
    environ = require('bem-environ'),

    join = PATH.join,

    CORE_TECHS = environ.getLibPath('bem-core', '.bem/techs'),
    BEMBL_TECHS = environ.getLibPath('bem-bl', 'blocks-common/i-bem/bem/techs/v2');

function resolveTechs(registry, prefix) {
    return function(name) {
        return registry[name] = join(prefix, name + '.js');
    };
}

exports.getTechs = function() {
    var techs = {
        'bemjson.js' : 'bem/lib/tech/v2',
        'bemdecl.js' : 'v2/bemdecl.js',
        'deps.js' : 'v2/deps.js',
        'js' : 'v2/js-i',
        'css' : 'v2/css',
        'ie.css'  : 'v2/ie.css',
        'ie6.css' : 'v2/ie6.css',
        'ie7.css' : 'v2/ie7.css',
        'ie8.css' : 'v2/ie8.css',
        'ie9.css' : 'v2/ie9.css'
    };

    [
        'bemhtml',
        'bemtree',
        'vanilla.js',
        'browser.js',
        'i18n',
        'node.js'
    ].forEach(resolveTechs(techs, CORE_TECHS));

    [
        'i18n.keys.js'
    ].forEach(resolveTechs(techs, PATH.join('..', '..', '.bem', 'techs')));

    [
        'i18n',
        'i18n.html',
        'html'
    ].forEach(resolveTechs(techs, BEMBL_TECHS));

    return techs;
};

exports.defaultTechs = ['css', 'vanilla.js', 'deps.js', 'bemhtml', 'bemtree'];
