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

                if(node.view === node.VIEW.AUTHOR) {
                    return _.extend(result, {
                        posts: model.getNodesBySourceCriteria(req.lang, ['authors', 'translators'], req.params.id) });
                }

                if(node.view === node.VIEW.TAGS) {
                    return _.extend(result, {
                        posts: model.getNodesBySourceCriteria(req.lang, ['tags'], req.params.id) });
                }

                if(node.view === node.VIEW.AUTHORS) {
                    return _.extend(result, {
                        authors: model.getAuthors() });
                }

                return result;
            },

            run: function () {
                /**
                 * Middleware which performs all logic operations for request
                 * fill the context and push it to templates stack
                 * Finally returns html to response
                 * @returns {Function}
                 */
                return function (req, res, next) {
                    var ctx = {
                        req: req, //request object
                        bundleName: 'common',
                        lang: req.lang, //selected language
                        statics: config.get('app:statics:www')
                    };

                    ctx = _.extend(ctx, req.__data, this.getAdvancedData(req, req.__data.node));

                    return template.apply(ctx, req.lang, req.query.__mode)
                        .then(function (html) {
                            res.end(html);
                        })
                        .fail(function (err) {
                            next(err);
                        });
                };
            }
        });
    });
