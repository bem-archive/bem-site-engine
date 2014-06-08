var u = require('util'),
    _ = require('lodash'),

    logger = require('../logger')(module),
    HttpError = require('../errors').HttpError,

    constants = require('../constants'),
    config = require('../config'),
    router = require('./router'),
    model = require('../model');

module.exports = {

    /**
     * Returns node by request
     * @param req - {Object} http request object
     * @returns {RuntimeNode} founded node
     */
    getNodeByRequest: function(req) {
        return router.run(req);
    },


    getMenuByNode: function(req, node) {

    },



    /**
     * Loads advanced data for nodes with exotic views
     * @param req - {Object} http request object
     * @param node - {RuntimeNode} node from sitemap model
     * @returns {*}
     */
    getAdvancedData: function(req, node) {
        var  result = {
            people: model.getPeople(),
            peopleUrls: model.getPeopleUrls()
        };

        if(node.view === node.VIEW.AUTHOR) {
            return _.extend(result, {
                posts: this.getNodesBySourceCriteria(req.lang, ['authors', 'translators'], req.params.id) });
        }

        if(node.view === node.VIEW.TAGS) {
            return _.extend(result, {
                posts: this.getNodesBySourceCriteria(req.lang, ['tags'], req.params.id) });
        }

        if(node.view === node.VIEW.AUTHORS) {
            return _.extend(result, {
                authors: model.getAuthors() });
        }

        return result;
    }
};


