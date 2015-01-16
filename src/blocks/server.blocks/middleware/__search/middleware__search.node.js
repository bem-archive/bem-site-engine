var _ = require('lodash'),
    vow = require('vow');

modules.define('middleware__search', ['config', 'logger', 'model', 'template',
    'search_type_blocks', 'search_type_libs', 'search_type_tags'],
    function (provide, config, logger, model, template, searchBlocks, searchLibs, searchTags) {

    var BASE_CTX = {
        bundleName: 'common',
        statics: '',
        block: 'search-results'
    };

    function getData(searchText, lang) {
        return vow.all([
            searchBlocks.search(searchText, lang),
            searchLibs.search(searchText, lang),
            searchTags.search(searchText, lang)
        ]).spread(function (blocks, libs, tags) {
            return blocks.concat(libs).concat(tags);
        });
    }

    provide(function () {
        return function (req, res, next) {
            var lang = req.lang,
                url = req.path,
                text = req.query.text || '',
                searchText,
                ctx;

            if (!url.match(/^\/search\/?$/)) {
                return next();
            }

            searchText = text.trim();
            ctx = _.extend({ req: req, lang: lang, text: searchText }, BASE_CTX);

            return getData(searchText, lang)
                .then(function (results) {
                    return template.apply(_.extend({ data: results }, ctx), req, req.query.__mode);
                })
                .then(function (html) {
                    return res.end(html);
                })
                .fail(function (err) {
                    return next(err);
                });
        };
    });
});
