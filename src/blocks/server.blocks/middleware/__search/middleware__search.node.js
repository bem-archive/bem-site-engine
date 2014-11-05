var _ = require('lodash');

modules.define('middleware__search', ['config', 'logger', 'model', 'template'], function(provide, config, logger, model, template) {

    function getBlocks(text, lang) {
        var nodes,
            results;

        nodes = model.getNodesByCriteria(function() {
            return text.length > 1 && 'block' === this.class &&
                this.title && this.title[lang].indexOf(text) !== -1;
        }, false);

        results = nodes.length ? _.values(convertBlockResults(nodes, lang)) : [];

        return _.sortBy(results, function(item) {
            return item.block;
        });
    }

    function getLibs(text, lang) {
        var libs = model.getNodesByCriteria(function() {
            return this.lib && !!~this.lib.indexOf(text);
        }, false);

        return libs.length ? [{
            class: 'post',
            category: lang === 'ru' ? 'Библиотеки' : 'Libs',
            items: libs
        }] : [];
    }

    function getPostsByTag(text, lang) {
        var nodes = model.getNodesBySourceCriteria(lang, 'tags', text);

        return nodes.length ? convertPostsByTagResults(nodes) : [];
    }

    function getBlockDescription(item, lang) {
        var key = item.source.key,
            block = model.getBlocks()[key],
            description;

        if(!block || !block.data) {
            return '';
        }

        block = block.data[lang] || block.data;
        description = block.description;

        if(_.isArray(description)) {
            description = description[0].content;
        }
        return description;
    }

    function convertBlockResults(result, lang) {
        return result.reduce(function(prev, item) {
            var route = item.route,
                conditions = route.conditions,
                library = conditions.lib,
                version = conditions.version,
                level = conditions.level,
                block = conditions.block,
                uniqName = block + '-' + library,
                existed = prev[uniqName] || {
                    block: block,
                    lib: library,
                    title: item.title,
                    description: getBlockDescription(item, lang),
                    versions: {},
                    class: 'block'
                };

            existed.versions[version] = (existed.versions[version] || []).concat({
                level: level,
                url: item.url
            });

            prev[uniqName] = existed;

            return prev;
        }, {});
    }

    function convertPostsByTagResults(result) {
        return result.map(function(item) {
            return {
                class: 'post',
                category: item.title,
                items: item.items
            };
        });
    }

    function getData(text, req) {
        var lang = req.lang,
            blocks = getBlocks(text, lang),
            postsByTag = getPostsByTag(text, lang),
            libs = getLibs(text, lang);

        return blocks.concat(libs, postsByTag);
    }

    provide({
        run: function(){
            var self = this;

            return function(req, res, next) {
                var url = req.path,
                    text = req.query.text || '',
                    ctx,
                    data;

                if(!url.match(/^\/search\/?$/)) {
                    return next();
                }

                data = getData(text, req);

                if(!data.length) data = self.getDataFallback();

                ctx = {
                    req: req,
                    lang: req.lang,
                    bundleName: 'common',
                    statics: '',
                    block: 'search-results',
                    data: data,
                    text: text
                };

                return template.apply(ctx, req, req.query.__mode)
                    .then(function (html) {
                        res.end(html);
                    })
                    .fail(function(err) {
                        next(err);
                    });
            };
        },

        getDataFallback: function() {
            return [];
        }
    });
});
