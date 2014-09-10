var _ = require('lodash');

modules.define('middleware__page', ['config', 'logger', 'model', 'template'],
    function(provide, config, logger, model, template) {

        provide({

            /**
             * Loads advanced data for nodes with exotic views
             * @param req - {Object} http request object
             * @param node - {RuntimeNode} node from sitemap model
             * @returns {*}
             */
            getAdvancedData: function(req, node) {
                var result = {
                    people: model.getPeople(),
                    peopleUrls: model.getPeopleUrls()
                };

                if(node.VIEW.AUTHOR === node.view) {
                    return _.extend(result, {
                        posts: model.getNodesBySourceCriteria(req.lang, ['authors', 'translators'], req.params.id) });
                }

                if(node.VIEW.TAGS === node.view) {
                    return _.extend(result, {
                        posts: model.getNodesBySourceCriteria(req.lang, ['tags'], req.params.id) });
                }

                if(node.VIEW.AUTHORS === node.view) {
                    return _.extend(result, {
                        authors: model.getAuthors() });
                }

                if(node.VIEW.BLOCK === node.view) {
                    var s = node.source,
                        d = model.getBlocks()[s.key];

                    s.data = d.data;
                    s.jsdoc = d.jsdoc;

                    return {};
                }

                return result;
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
                    var ctx = {
                        block: 'i-global',
                        req: req, //request object //TODO remove it and fix templates
                        bundleName: 'common',
                        lang: req.lang, //selected language
                        statics: ''
                    };

                    ctx = _.extend(ctx, req.__data, self.getAdvancedData(req, req.__data.node));

                    return template.apply(ctx, req, req.query.__mode)
                        .then(function (html) {
                            res.end(html);
                        })
                        .fail(function(err) {
                            next(err);
                        });
                };
            }
        });
    });
