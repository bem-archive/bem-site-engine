var u = require('util'),
    _ = require('lodash'),
    config = require('../lib/config'),
    DynamicNode = require('./dynamic').DynamicNode,
    nodes = require('./index');

/**
 * Subclass of dynamic nodes which describe single version of library
 * @param node - {Object} base node configuration
 * @param parent - {BaseNode} parent node
 * @param version - {Object} version of library
 * @constructor
 */
var VersionNode = function(parent, routes, version, searchLibraries, searchBlocks, index) {

    this.setTitle(version)
        .setSource(version)
        .processRoute(routes, parent, {
            conditions: {
                lib: version.repo,
                version: version.ref
            }
        })
        .init(parent)
        .addItems(routes, version, searchLibraries, searchBlocks);

    searchLibraries[version.repo] =
        searchLibraries[version.repo] || new nodes.search.Library(version.repo);

    //TODO fix this.source.ru.content !
    searchLibraries[version.repo].addVersion(
        new nodes.search.Version(version.ref, this.url, this.source.ru.content, !index));
};

VersionNode.prototype = Object.create(DynamicNode.prototype);

/**
 * Sets title for node
 * @param version - {Object} library version
 * @returns {VersionNode}
 */
VersionNode.prototype.setTitle = function(version) {
    var languages = config.get('common:languages') || ['en'];
    this.title = languages.reduce(function(prev, lang) {
        prev[lang] = version.ref;
        return prev;
    }, {});
    return this;
};

/**
 * Sets source for node
 * @param version - {Object} library version
 * @returns {VersionNode}
 */
VersionNode.prototype.setSource = function(version) {
    var languages = config.get('common:languages') || ['en'],
        readme = version.docs ? version.docs['readme'] : version['readme'];

    this.source = languages.reduce(function(prev, lang) {
        prev[lang] = {
            title: version.repo,
            deps: version.deps,
            url: version.url,
            content: (readme && readme.content) ? readme.content[lang] : null
        };
        return prev
    }, {});

    return this;
};

/**
 * Sets class for node
 * @returns {VersionNode}
 */
VersionNode.prototype.setClass = function() {
    this.class = 'version';
    return this;
};

/**
 *
 * @param targetNode
 * @param version
 */
VersionNode.prototype.addItems = function(routes, version, searchLibraries, searchBlocks) {
    this.items = this.items || [];

    var docs = version.docs || {
        changelog: {
            title: {
                en: 'Changelog',
                ru: 'История изменений'
            },
            content: version.changelog
        },
        migration: {
            title: {
                en: 'Migration',
                ru: 'Миграция'
            },
            content: version.migration
        },
        notes: {
            title: {
                en: 'Release Notes',
                ru: 'Замечания к релизу'
            },
            content: version.notes
        }
    };

    Object.keys(docs).forEach(function(item) {
        logger.verbose('add post %s to version %s of library %s', item, version.ref, version.repo);

        //verify existed docs
        if(!docs[item] || !docs[item].content) {
            return;
        }

        this.items.push(new nodes.post.PostNode(this, routes, version, docs[item], item));
    }, this);

    var levels = version.levels;
    if(!levels) return;

    levels.forEach(function(level) {
        level.name = level.name.replace(/\.(sets|docs)$/, '');

        //verify existed blocks for level
        if(level.blocks) {
            this.items.push(new nodes.level.LevelNode(this, routes, version, level, searchLibraries, searchBlocks));
        }
    }, this);
};

exports.VersionNode = VersionNode;
