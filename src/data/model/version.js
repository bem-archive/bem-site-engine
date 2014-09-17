var utility = require('../util'),
    nodes = require('./index');

/**
 * Subclass of dynamic nodes which describe single version of library
 * @param parent - {BaseNode} parent node
 * @param routes - {Object} application routes hash
 * @param version - {Object} version of library
 * @param search - {Object} search model
 * @param blocksHash - {Object} blocks data hash
 * @param index - {Number}
 * @constructor
 */
var VersionNode = function(parent, routes, version, search, blocksHash, index) {
    this.setTitle(version)
        .setSource(version)
        .processRoute(routes, parent, {
            conditions: {
                lib: version.repo,
                version: version.ref.replace(/\//g, '-')
            }
        })
        .init(parent)
        .addItems(routes, version, search, blocksHash, index);
};

VersionNode.prototype = Object.create(nodes.dynamic.DynamicNode.prototype);

/**
 * Sets title for node
 * @param version - {Object} library version
 * @returns {VersionNode}
 */
VersionNode.prototype.setTitle = function(version) {
    this.title = utility.getLanguages().reduce(function(prev, lang) {
        prev[lang] = version.ref.replace(/\//g, '-');
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
    var readme = version.docs ? version.docs.readme : {
        title: { en: 'Readme', ru: 'Readme'},
        content: version.readme
    };

    this.source = utility.getLanguages().reduce(function(prev, lang) {
        prev[lang] = {
            title: version.repo,
            deps: version.deps,
            url: version.url,
            content: (readme && readme.content) ? readme.content[lang] : null
        };
        return prev;
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
 * Adds items for node
 * @param routes - {Object} application routes hash
 * @param version - {Object} version of library
 * @param search - {Object} search model
 * @param blocksHash - {Object} blocks data hash
 * @returns {VersionNode}
 */
VersionNode.prototype.addItems = function(routes, version, search, blocksHash, index) {
    var sl = search.libraries[version.repo];

    //TODO fix this.source.ru.content !
    sl = sl || new nodes.search.Library(version.repo);
    sl.addVersion(new nodes.search.Version(version.ref, this.url, this.source.ru.content, !index));
    search.libraries[version.repo] = sl;

    this.items = this.items || [];

    var docs = version.docs || {
        changelog: {
            title: { en: 'Changelog', ru: 'История изменений'},
            content: version.changelog
        },
        migration: {
            title: { en: 'Migration', ru: 'Миграция' },
            content: version.migration
        },
        notes: {
            title: { en: 'Release Notes', ru: 'Замечания к релизу' },
            content: version.notes
        }
    };

    //add doc nodes to library version
    Object.keys(docs)
        .filter(function(item) {
            return 'readme' !== item;
        })
        .forEach(function(item) {
            //verify existed docs
            if(!docs[item] || !docs[item].content) {
                return;
            }
            this.items.push(new nodes.post.PostNode(this, routes, version, docs[item], item));
        }, this);

    //add custom nodes to library version
    if(version.custom) {
        version.custom.forEach(function(item) {
            item.url += '#';
            this.items.push(new nodes.base.BaseNode(item, this));
        }, this);
    }

    var levels = version.levels;
    if(!levels) return this;

    //add level nodes to library version
    levels.forEach(function(level) {
        level.name = level.name.replace(/\.(sets|docs)$/, '');

        //verify existed blocks for level
        if(level.blocks) {
            this.items.push(new nodes.level.LevelNode(this, routes, version, level, search, blocksHash));
        }
    }, this);

    return this;
};

exports.VersionNode = VersionNode;
