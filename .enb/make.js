module.exports = function(config) {
    config.setLanguages(['ru', 'en']);

    // Сборка общих технологий для всех бандлов
    config.nodes('src/bundles/*.bundles/*', function(nodeConfig) {
        nodeConfig.addTechs([
            use('levels', { levels: getLevels(config) }),
            use('files'),
            use('deps', { target: '?.bemdecl.js' }),
            use('roole', { target: '?.noprefix.css' }),
            use('autoprefixer', {
                browsers: ['last 2 versions', 'last 3 Chrome versions'],
                sourceTarget: '?.noprefix.css'
            }),
            use('bemhtml', { devMode: false }),
            use('i18n-keysets', { lang: 'all' }),
            use('i18n-keysets', { lang: '{lang}' }),
            use('i18n-lang', { lang: 'all' }),
            use('i18n-lang', { lang: '{lang}' })
        ]);

        nodeConfig.addTargets([
            '_?.css', '_?.bemhtml.js', '_?.lang.all.js', '_?.lang.{lang}.js'
        ]);
    });

    // Сборка технологий, специфичных для `common` бандла
    config.node('src/bundles/desktop.bundles/common', function(nodeConfig) {
        nodeConfig.addTechs([
            use('provider', { target: '?.bemdecl.js' }),
            use('js', { target: '?.pre.js' }),
            use('modules', { target: '?.js', source: '?.pre.js' }),
            use('bemtree', { devMode: false })
        ]);

        nodeConfig.addTargets([
            '_?.js', '_?.bemtree.js'
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
                use('copy', { sourceTarget: '?.css', destTarget: '_?.css' }),
                use('copy', { sourceTarget: '?.js', destTarget: '_?.js' }),
                use('copy', { sourceTarget: '?.bemhtml.js', destTarget: '_?.bemhtml.js' }),
                use('copy', { sourceTarget: '?.bemtree.js', destTarget: '_?.bemtree.js' }),
                use('copy', { sourceTarget: '?.lang.all.js', destTarget: '_?.lang.all.js' }),
                use('copy', { sourceTarget: '?.lang.{lang}.js', destTarget: '_?.lang.{lang}.js' })
            ]);
        });
    });

    // Обработка борщиком финальных файлов, получившихся в результате сборки
    config.mode('production', function() {
        config.nodes('src/bundles/*.bundles/*', function(nodeConfig) {
            nodeConfig.addTechs([
                use('borschik', { sourceTarget: '?.css', destTarget: '_?.css', minify: true, freeze: true }),
                use('borschik', { sourceTarget: '?.js', destTarget: '_?.js', minify: true, freeze: false }),
                use('borschik', { sourceTarget: '?.bemhtml.js', destTarget: '_?.bemhtml.js',
                    minify: true, freeze: false }),
                use('borschik', { sourceTarget: '?.bemtree.js', destTarget: '_?.bemtree.js',
                    minify: true, freeze: false }),
                use('borschik', { sourceTarget: '?.lang.{lang}.js', destTarget: '_?.lang.{lang}.js',
                    minify: true, freeze: false }),
                use('borschik', { sourceTarget: '?.lang.all.js', destTarget: '_?.lang.all.js',
                    minify: true, freeze: false })
            ]);
        });
    });
};

// Хэш технологий
var techs = {
    levels         : require('enb/techs/levels'),
    files          : require('enb/techs/files'),
    provider       : require('enb/techs/file-provider'),
    copy           : require('enb/techs/file-copy'),
    bemdecl        : require('enb/techs/bemdecl-from-bemjson'),
    deps           : require('enb/techs/deps'),
    modules        : require('enb-modules/techs/prepend-modules'),
    js             : require('enb/techs/browser-js'),
    roole          : require('enb-roole-techs/techs/css-roole'),
    autoprefixer   : require('enb-autoprefixer-techs/techs/css-autoprefixer'),
    bemhtml        : require('enb-bemxjst/techs/bemhtml-old'),
    bemtree        : require('enb-bemxjst/techs/bemtree-old'),
    'i18n-keysets' : require('enb/techs/i18n-merge-keysets'),
    'i18n-lang'    : require('enb/techs/i18n-lang-js'),
    'i18n-html'    : require('enb/techs/html-from-bemjson-i18n'),
    borschik       : require('enb/techs/borschik')
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
        { path: 'libs/bem-forum/src/views/common.blocks', check: false },
        { path: 'libs/bem-forum/src/themes/bem-www/common.blocks', check: false },
        'src/blocks/common.blocks'
    ].map(function(level) {
        return config.resolvePath(level);
    });
}
