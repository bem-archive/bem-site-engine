var utility = require('../util'),
    nodes = require('./index');

/**
 * Subclass of dynamic nodes which describe post of library
 * @param parent - {VersionNode} parent node object
 * @param routes - {Object} application routes hash
 * @param version - {Object} library version object
 * @param doc - {Object} doc object
 * @param id - {String} key of doc
 * @constructor
 */
var PostNode = function(parent, routes, version, doc, id) {
    this.setTitle(doc)
        .setSource(doc)
        .processRoute(routes, parent, {
            conditions: {
                lib: version.repo,
                version: version.ref,
                id: id
            }
        })
        .init(parent)
        .createBreadcrumbs();
};

PostNode.prototype = Object.create(nodes.dynamic.DynamicNode.prototype);

/**
 * Sets title for node
 * @param doc - {Object} doc object
 * @returns {PostNode}
 */
PostNode.prototype.setTitle = function(doc) {
    this.title = doc.title;
    return this;
};

/**
 * Sets source for node
 * @param doc - {Object} doc object
 * @returns {PostNode}
 */
PostNode.prototype.setSource = function(doc) {
    this.source = utility.getLanguages().reduce(function(prev, lang) {
        prev[lang] = {
            title: doc.title[lang],
            content: doc.content[lang]
        };
        return prev;
    }, {});

    return this;
};

/**
 * Sets class for node
 * @returns {PostNode}
 */
PostNode.prototype.setClass = function() {
    this.class = 'post';
    return this;
};

exports.PostNode = PostNode;
