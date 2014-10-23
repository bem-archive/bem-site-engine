var path = require('path'),
    vow = require('vow'),
    _ = require('lodash');

modules.define('middleware__page', ['config', 'logger', 'constants', 'model', 'template', 'providerFile'],
    function(provide, config, logger, constants, model, template, providerFile) {

        provide({

            /**
             * Loads advanced data for nodes with exotic views
             * @param req - {Object} http request object
             * @param node - {RuntimeNode} node from sitemap model
             * @returns {*}
             */
            getAdvancedData: function(req, node) {
                var lang = req.lang,
                    result = {};
                return vow.all([
                        model.getPeople(),
                        model.getPeople('url'),
                        model.getSourceOfNode(node, lang)
                    ])
                    .spread(function(people, peopleUrls, source) {
                        result.people = people;
                        result.peopleUrls = peopleUrls;
                        if(source) {
                            node.source = {};
                            node.source[lang] = source;
                        }
                        return result;
                    })
                    .then(function(result) {
                        if(node.view === 'block') {
                            var s = node.source,
                                dataKey,
                                jsdocKey;
                            if(!s) {
                                return vow.resolve(result);
                            }

                            dataKey = s.data;
                            jsdocKey = s.jsdoc;

                            if(!dataKey || !jsdocKey) {
                                return vow.resolve(result);
                            }

                            return vow.all([ model.getBlock(dataKey), model.getBlock(jsdocKey) ])
                                .spread(function(data, jsdoc) {
                                    s.data = data;
                                    s.jsdoc = jsdoc;
                                    return vow.resolve(result);
                                });
                        } else if(node.view === 'authors') {
                            return model.getAuthors().then(function(authors) {
                                return _.extend(result, { authors: authors });
                            });
                        } else if(node.view === 'author') {
                            return model.getNodesByPeopleCriteria(lang, node).then(function(posts) {
                                return _.extend(result, { posts: posts });
                            });
                        } else if(node.view === 'tags') {
                            return model.getNodesByTagsCriteria(lang, node).then(function(posts) {
                                return _.extend(result, { posts: posts });
                            });
                        } else {
                            return vow.resolve(result);
                        }
                    });
            },

            run: function () {

                var self = this;
                /**
                 * Middleware which performs all logic operations for request
                 * fill the context and push it to templates stack
                 * Finally returns html to response
                 * @returns {Function}
                 */
                return function(req, res, next) {
                    var node = req.__data.node,
                        pagePath = path.join(constants.PAGE_CACHE, node.url),
                        ctx = {
                            block: 'i-global',
                            req: req, //request object //TODO remove it and fix templates
                            bundleName: 'common',
                            lang: req.lang, //selected language
                            statics: ''
                        };

                    return self.getAdvancedData(req, node)
                        .then(function(advanced) {
                            ctx = _.extend(ctx, req.__data, advanced);
                            return template.apply(ctx, req, req.query.__mode);
                        })
                        .then(function (html) {
                            providerFile.makeDir({ path: pagePath })
                                .then(function() {
                                    return providerFile.save({
                                        path: path.join(pagePath, (req.lang + '.html.gzip')),
                                        archive: true,
                                        data: html
                                    });
                                });
                            res.end(html);
                        })
                        .fail(function(err) {
                            next(err);
                        });
                };
            }
        });
    });
