module.exports = function(config) {
    config.setLanguages(['ru', 'en']);

    // Сборка общих технологий для всех бандлов
    config.nodes('src/bundles/*.bundles/*', function(nodeConfig) {
        nodeConfig.addTechs([
            use('levels', { levels: getLevels(config) }),
            use('files'),
            use('deps', { target: '?.bemdecl.js' }),
            use('stylus', { sourceSuffixes: ['css', 'ie.css', 'styl', 'ie.styl'], target: '?.ie.css' }),
            use('stylus', { target: '?.noprefix.css' }),
            use('autoprefixer', {
                browserSupport: ['last 2 versions', 'last 3 Chrome versions'],
                sourceTarget: '?.noprefix.css'
            }),
            use('bemhtml', { devMode: false }),
            use('i18n-keysets', { lang: 'all' }),
            use('i18n-keysets', { lang: '{lang}' }),
            use('i18n-lang', { lang: 'all' }),
            use('i18n-lang', { lang: '{lang}' })
        ]);

        nodeConfig.addTargets([
            '?.min.css', '?.min.ie.css'
        ]);
    });

    // Сборка технологий, специфичных для `common` бандла
    config.node('src/bundles/desktop.bundles/common', function(nodeConfig) {
        nodeConfig.addTechs([
            use('provider', { target: '?.bemdecl.js' }),
            use('js', { target: '?.pre.js' }),
            use('modules', { target: '?.js', source: '?.pre.js' }),
            use('bemtree', { devMode: false }),
            use('nodejs', {target: '?.pre.node.js' }),
            use('modules', {target: '?.node.js', source: '?.pre.node.js' }),
            use('merge', {
                target: '?.template.js',
                sources: ['?.bemtree.js', '?.bemhtml.js']
            }),
            use('template-i18n', {
                target: '?.template.i18n.js',
                sourceTarget: '?.template.js',
                langTargets: ['all'].concat(config.getLanguages()).map(function (lang) {
                    return '?.lang.' + lang + '.js';
                })
            })
        ]);

        nodeConfig.addTargets([
            '?.min.js', '?.min.template.i18n.js', '?.node.js'
        ]);
    });

    // Сборка страниц ошибок
    config.nodes('src/bundles/errors.bundles/*', function(nodeConfig) {
        nodeConfig.addTechs([
            use('provider', { target: '?.bemjson.js' }),
            use('bemdecl'),
            use('i18n-html', { lang: '{lang}' })
        ]);

        nodeConfig.addTargets([
            '?.{lang}.html'
        ]);
    });

    // Псевдообработка финальных файлов, получившихся в результате сборки:
    // копируем файлы, добавляя префикс `_`
    config.mode('development', function() {
        config.nodes('src/bundles/*.bundles/*', function(nodeConfig) {
            nodeConfig.addTechs([
                use('copy', { sourceTarget: '?.css', destTarget: '?.min.css' }),
                use('copy', { sourceTarget: '?.ie.css', destTarget: '?.min.ie.css' }),
                use('borschik', { sourceTarget: '?.js', destTarget: '?.borschik.js', minify: false, freeze: true }),
                use('copy', { sourceTarget: '?.borschik.js', destTarget: '?.min.js' }),
                use('copy', { sourceTarget: '?.template.i18n.js', destTarget: '?.min.template.i18n.js' })
            ]);
        });
    });

    // Обработка борщиком финальных файлов, получившихся в результате сборки
    config.mode('testing', function() {
        config.nodes('src/bundles/*.bundles/*', function(nodeConfig) {
            nodeConfig.addTechs([
                use('borschik', { sourceTarget: '?.css', destTarget: '?.min.css', minify: true, freeze: true }),
                use('borschik', { sourceTarget: '?.ie.css', destTarget: '?.min.ie.css', minify: true, freeze: true }),
                use('borschik', { sourceTarget: '?.js', destTarget: '?.min.js', minify: true, freeze: true }),
                use('borschik', { sourceTarget: '?.template.i18n.js', destTarget: '?.min.template.i18n.js',
                    minify: true, freeze: false })
            ]);
        });
    });

    // Обработка борщиком финальных файлов, получившихся в результате сборки
    config.mode('production', function() {
        config.nodes('src/bundles/*.bundles/*', function(nodeConfig) {
            nodeConfig.addTechs([
                use('borschik', { sourceTarget: '?.css', destTarget: '?.min.css', minify: true, freeze: true }),
                use('borschik', { sourceTarget: '?.ie.css', destTarget: '?.min.ie.css', minify: true, freeze: true }),
                use('borschik', { sourceTarget: '?.js', destTarget: '?.min.js', minify: true, freeze: true }),
                use('borschik', { sourceTarget: '?.template.i18n.js', destTarget: '?.min.template.i18n.js',
                    minify: true, freeze: false })
            ]);
        });
    });
};

// Хэш технологий
var techs = {
    levels          : require('enb/techs/levels'),
    files           : require('enb/techs/files'),
    provider        : require('enb/techs/file-provider'),
    copy            : require('enb/techs/file-copy'),
    merge           : require('enb/techs/file-merge'),
    bemdecl         : require('enb/techs/bemdecl-from-bemjson'),
    deps            : require('enb/techs/deps'),
    modules         : require('enb-modules/techs/prepend-modules'),
    js              : require('enb-diverse-js/techs/browser-js'),
    stylus          : require('enb-stylus/techs/css-stylus'),
    autoprefixer    : require('enb-autoprefixer/techs/css-autoprefixer'),
    bemhtml         : require('enb-bemxjst/techs/bemhtml-old'),
    bemtree         : require('enb-bemxjst/techs/bemtree-old'),
    'template-i18n' : require('./techs/template-i18n'),
    'i18n-keysets'  : require('enb-bem-i18n/techs/i18n-merge-keysets'),
    'i18n-lang'     : require('enb-bem-i18n/techs/i18n-lang-js'),
    'i18n-html'     : require('enb-bemxjst/techs/html-from-bemjson-i18n'),
    borschik        : require('enb-borschik/techs/borschik'),
    nodejs          : require('enb-diverse-js/techs/node-js'),
    'enb-modules'   : require('enb-modules/techs/prepend-modules')
};

/**
 * Возвращает объект-технологию для `nodeConfig`
 *
 * @param {String} tech название технологии
 * @param {Object} params параметры для технологии
 * @returns {*[]}
 */
function use(tech, params) {
    return [
        techs[tech],
            params || {}
    ];
}

/**
 * Получение уровней переопределения
 *
 * @param {Object} config
 * @returns {*|Array}
 */
function getLevels(config) {
    return [
        { path: 'libs/bem-core/common.blocks', check: false },
        { path: 'libs/bem-core/desktop.blocks', check: false },
        { path: 'libs/bem-components/common.blocks', check: false },
        { path: 'libs/bem-components/desktop.blocks', check: false },
        { path: 'libs/bem-components/design/common.blocks', check: false },
        { path: 'libs/bem-components/design/desktop.blocks', check: false },
        'src/blocks/server.blocks',
        'src/blocks/common.blocks'
    ].map(function(level) {
            return config.resolvePath(level);
        });
}
