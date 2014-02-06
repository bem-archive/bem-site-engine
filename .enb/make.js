var fs = require('fs'),
    commonBundleMask = /src\/bundles\/desktop\.bundles\/common/,
    errorBundlesMask = /src\/bundles\/errors\.bundles\/.*/,
    bundlesMask = /src\/bundles\/.*\.bundles/;

module.exports = function(config) {
    config.setLanguages(['ru', 'en']);
    config.nodes('src/bundles/*.bundles/*');

    // Сборка страниц ошибок
    config.nodeMask(errorBundlesMask, function(nodeConfig) {
        nodeConfig.addTechs([
            [ require('enb/techs/file-provider'), { target: '?.bemjson.js' } ],
            require('enb/techs/bemdecl-from-bemjson'),
            [ require('enb/techs/html-from-bemjson-i18n'), { lang: '{lang}' } ]
        ]);
        nodeConfig.addTargets([
            '?.{lang}.html'
        ]);
    });

    // Сборка технологий, специфичных для `common` бандла
    config.nodeMask(commonBundleMask, function(nodeConfig) {
        nodeConfig.addTechs([
            [ require('enb/techs/file-provider'), { target: '?.bemdecl.js' } ],
            [ require('enb/techs/browser-js'), { target: '?.pre.js' } ],
            [ require('enb-modules/techs/prepend-modules'), { target: '?.js', source: '?.pre.js' } ],
            [ require('enb-bemxjst/techs/bemtree-old'), { devMode: false } ],
        ]);
        nodeConfig.addTargets([
            '_?.js', '_?.bemtree.js'
        ]);
    });

    // Сборка общих технологий для всех бандлов
    config.nodeMask(bundlesMask, function(nodeConfig) {
        nodeConfig.addTechs([
            [ require('enb/techs/levels'), { levels: getLevels(config) } ],
            require('enb/techs/files'),
            [ require('enb/techs/deps'), { target: '?.bemdecl.js' } ],
            [ require('enb/techs/css'), { target: '?.noprefix.css' } ],
            [ require('enb-autoprefixer-techs/techs/css-autoprefixer'), {
                browsers: ['last 2 versions', 'last 3 Chrome versions'],
                sourceTarget: '?.noprefix.css'
            } ],
            [ require('enb-bemxjst/techs/bemhtml-old'), { devMode: false } ],
            [ require('enb/techs/i18n-merge-keysets'), { lang: 'all' } ],
            [ require('enb/techs/i18n-merge-keysets'), { lang: '{lang}' } ],
            [ require('enb/techs/i18n-lang-js'), { lang: 'all' } ],
            [ require('enb/techs/i18n-lang-js'), { lang: '{lang}' } ]
        ]);
        nodeConfig.addTargets([
            '_?.css', '_?.bemhtml.js', '_?.lang.all.js', '_?.lang.{lang}.js'
        ]);
    });

    // Псевдообработка финальных файлов, получившихся в результате сборки:
    // копируем файлы, добавляя префикс `_`
    config.mode('development', function() {
        config.nodeMask(bundlesMask, function(nodeConfig) {
            var fileCopy = require('enb/techs/file-copy');

            nodeConfig.addTechs([
                [ fileCopy, { sourceTarget: '?.css', destTarget: '_?.css' } ],
                [ fileCopy, { sourceTarget: '?.js', destTarget: '_?.js' } ],
                [ fileCopy, { sourceTarget: '?.bemhtml.js', destTarget: '_?.bemhtml.js' } ],
                [ fileCopy, { sourceTarget: '?.bemtree.js', destTarget: '_?.bemtree.js' } ],
                [ fileCopy, { sourceTarget: '?.lang.all.js', destTarget: '_?.lang.all.js' } ],
                [ fileCopy, { sourceTarget: '?.lang.{lang}.js', destTarget: '_?.lang.{lang}.js' } ]
            ]);
        });
    });

    // Обработка борщиком финальных файлов, получившихся в результате сборки
    config.mode('production', function() {
        config.nodeMask(bundlesMask, function(nodeConfig) {
            var borschik = require('enb/techs/borschik');

            nodeConfig.addTechs([
                [ borschik, { sourceTarget: '?.css', destTarget: '_?.css', minify: true, freeze: true } ],
                [ borschik, { sourceTarget: '?.js', destTarget: '_?.js', minify: true, freeze: false } ],
                [ borschik, { sourceTarget: '?.bemhtml.js', destTarget: '_?.bemhtml.js',
                    minify: true, freeze: false } ],
                [ borschik, { sourceTarget: '?.bemtree.js', destTarget: '_?.bemtree.js',
                    minify: true, freeze: false } ],
                [ borschik, { sourceTarget: '?.lang.{lang}.js', destTarget: '_?.lang.{lang}.js',
                    minify: true, freeze: false } ],
                [ borschik, { sourceTarget: '?.lang.all.js', destTarget: '_?.lang.all.js',
                    minify: true, freeze: false  } ]
            ]);
        });
    });
};

/**
 * Получение уровней переопределения
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
