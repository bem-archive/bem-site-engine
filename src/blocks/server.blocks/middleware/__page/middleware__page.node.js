var vow = require('vow'),
    // path = require('path'),
    _ = require('lodash');

modules.define('middleware__page', ['config', 'logger', 'util', 'model', 'template'],
    function (provide, config, logger, util, model, template) {

        provide({

            /**
             * Loads advanced data for nodes with exotic views
             * @param req - {Object} http request object
             * @param node - {RuntimeNode} node from sitemap model
             * @returns {*}
             */
            getAdvancedData: function (req, node) {
                var lang = req.lang,
                    result = {};

                return vow.all([
                        model.getPeople(),
                        model.getPeopleUrls(),
                        model.getSourceOfNode(node, lang)
                    ])
                    .spread(function (people, peopleUrls, source) {
                        result.people = people;
                        result.peopleUrls = peopleUrls;

                        if (source) {
                            node.source = {};
                            node.source[lang] = source;
                        }

                        return result;
                    })
                    .then(function (result) {
                        if (node.view === 'block') {
                            var source = node.source;

                            if (!source) return vow.resolve(result);

                            var fields = ['data', 'jsdoc', 'blocksData', 'examplesData'];

                            return vow.all(fields.map(function (field) {
                                var key = source[field];
                                // If docs or jsdoc not exist, it must be empty object
                                // for legacy docs data structure
                                return key ? model.getBlock(key) : {};
                            })).then(function (vals) {
                                vals.forEach(function (val, idx) {
                                    source[fields[idx]] = val;
                                });

                                return vow.resolve(result);
                            });
                        } else if (node.view === 'authors') {
                            return model.getAuthors().then(function (authors) {
                                return _.extend(result, { authors: authors });
                            });
                        } else if (node.view === 'author') {
                            return model.getNodesByPeopleCriteria(lang, node).then(function (posts) {
                                return _.extend(result, { posts: posts });
                            });
                        } else if (node.view === 'tags') {
                            return model.getNodesByTagsCriteria(lang, node).then(function (posts) {
                                return _.extend(result, { posts: posts });
                            });
                        } else {
                            return vow.resolve(result);
                        }
                    });
            },

            run: function () {

                var _this = this;
                /**
                 * Middleware which performs all logic operations for request
                 * fill the context and push it to templates stack
                 * Finally returns html to response
                 * @returns {Function}
                 */
                return function (req, res, next) {
                    var node = req.__data.node,
                        locals = res.locals,
                        ctx = {
                            block: 'root',
                            data: {
                                title: locals.pageTitle,
                                forum: locals,
                                req: req, // request object TODO remove it and fix templates
                                bundleName: 'common',
                                lang: req.lang, // selected language
                                statics: ''
                            }
                        };

                    return _this.getAdvancedData(req, node)
                        .then(function (advanced) {
                            ctx.data = _.extend(ctx.data, req.__data, advanced);
                            return template.apply(ctx, req, res, req.query.__mode);
                        })
                        .then(function (html) {
                            if (!req.disableCache) {
                                util.putPageToCache(req, html);
                            }

                            res.contentType('text/html; charset=UTF-8');
                            res.end(html);
                        })
                        .fail(function (err) {
                            next(err);
                        });
                };
            }
        });
    });
