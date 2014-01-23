var _ = require('lodash'),
    Susanin = require('susanin'),
    logger = require('../logger')(module),
    HttpError = require('../errors').HttpError,
    leData = require('./le-data'),
    leJspath = require('./le-jspath'),
    leApp = require('./le-app');

module.exports = {

    getNodeByRequest: function(req) {
        logger.debug('get node by request %s', req.url);

        var name = req.route,
            params = req.params,
            sitemap = leApp.getSitemap(),
            result,
            nodeR = function(node, parent) {

                if(_.has(node, 'route') && _.isObject(node.route)) {

                    if(node.route.name !== name) {
                        return;
                    }

                    if(_.has(node.route, 'pattern')) {
                        result = node;
                    }

                    ['conditions'].forEach(function(item) {
                        if(_.has(node.route, item)) {
                            if(_.keys(params).some(function(paramKey) {
                                return _.has(node.route[item], paramKey) &&
                                    params[paramKey] === node.route[item][paramKey];
                            })) {
                                result = node;
                            };
                        }
                    });

                }

                //deep into node items
                if(_.has(node, 'items')) {
                    node.items.forEach(function(item) {
                        nodeR(item, node);
                    });
                }
            };

        try {
            sitemap.forEach(function(item) {
                nodeR(item, null);

                if(!_.isUndefined(result)) {
                    return;
                }
            });
        }catch(e) {
            logger.error(e)
        }

        if(!_.isUndefined(result)) {
            logger.debug('find node %s %s', result.id, result.source);
        }else {
            logger.error('cannot find node by url %s', req.url);
        }

        return result;
    },

    getMetaByNode: function(req, node) {
        var source,
            meta = {};

        if(_.has(node, 'source')){
            source = leData.getData()[node.id][req.prefLocale];

            if(source) {
                //title = apply('buildTitle', this.ctx.content = [source.title, BEM.I18N('main-menu', this.data.req.route)]);

                meta['description'] = meta['ogDescription'] = source.summary;
                meta['keywords'] = meta['ogKeywords'] = source.tags ? source.tags.join(', ') : '';

                if(_.has(source, 'ogImage') && source['ogImage'].length > 0) {
                    meta['image'] = source['ogImage'];
                }else if(_.has(source, 'thumbnail') && source['thumbnail'].length > 0) {
                    meta['image'] = source['thumbnail'];
                }

                meta['ogType'] = source.type === 'post' ? 'article': null;
                meta['ogUrl'] = req;
            }
        }else{

        }

        return meta;
    }
};
