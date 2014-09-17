var util = require('util'),
    _ = require('lodash'),
    vow = require('vow'),

    utility = require('../util'),
    renderer = require('../renderer'),
    providers = require('../providers'),
    logger = require('../logger');

var Meta = function(meta, lang, collected) {
    Object.keys(meta).forEach(function(key) { this[key] = meta[key]; }, this);

    this
        .convertDate('createDate')
        .convertDate('editDate')
        .collectPeople('authors', collected)
        .collectPeople('translators', collected)
        .collectTags(lang, collected)
        .setRepo();
};

Meta.prototype = {

    /**
     * Converts date fields of post meta information to milliseconds
     * @param field - {String} name of field
     * @returns {Meta}
     */
    convertDate: function(field) {
        this[field] && (this[field] = utility.dateToMilliseconds(this[field]));
        return this;
    },

    /**
     * Collects people data of post
     * @param field - {String} name of field
     * @param collected - {Object} hash of collected data
     * @returns {Meta}
     */
    collectPeople: function(field, collected) {
        this[field] && (collected[field] = collected[field].concat(this[field]));
        return this;
    },

    /**
     * Collects tags data for post
     * @param lang - {String} language
     * @param collected - {Object} hash of collected data
     * @returns {Meta}
     */
    collectTags: function(lang, collected) {
        if(this.tags) {
            collected.tags[lang] = collected.tags[lang] || [];
            collected.tags[lang] = collected.tags[lang].concat(this.tags);
        }
        return this;
    },

    /**
     * Sets repository information and urls
     * for issues and prose.io edit
     * @returns {Meta}
     */
    setRepo: function() {
        if(!this.content && this.stub) {
            this.repo = null;
            return this;
        }

        var regExp = /^https?:\/\/(.+?)\/(.+?)\/(.+?)\/(tree|blob)\/(.+?)\/(.+)/,
            parsedRepo = this.content.match(regExp);

        if(!parsedRepo) {
            this.repo = null;
            return this;
        }

        this.repo = {
            host: parsedRepo[1],
            user: parsedRepo[2],
            repo: parsedRepo[3],
            ref:  parsedRepo[5],
            path: parsedRepo[6]
        };

        //generate advanced params for repository
        this.repo = _.extend(this.repo, {
            type: this.getTypeOfRepository(),
            issue: this.generateIssueUrl(this.title),
            prose: this.generateProseUrl()
        });

        return this;
    },

    /**
     * Returns type of repository
     */
    getTypeOfRepository: function() {
        return this.repo.host.indexOf('github.com') > -1 ? 'public' : 'private';
    },

    /**
     * Returns generated url for issues of repo which post belongs to
     * @param title - {String} title of post
     * @returns {String}
     */
    generateIssueUrl: function(title) {
        var r = this.repo;
        return util.format('https://%s/%s/%s/issues/new?title=Feedback+for+\"%s\"', r.host, r.user, r.repo, title);
    },

    /**
     * Returns generated url for editing post by prose.io service
     * @returns {String}
     */
    generateProseUrl: function() {
        var r = this.repo;
        return util.format('http://prose.io/#%s/%s/edit/%s/%s', r.user, r.repo, r.ref, r.path);
    }
};

module.exports = function(obj) {
    logger.info('Load sources for nodes start', modules);

    var nodes = utility.findNodesByCriteria(obj.sitemap, function() { return this.source; }, false),
        collected = nodes.reduce(function(prev, item) {
            return analyzeMeta(prev, item);
        }, {
            authors: [],
            translators: [],
            tags: {}
        });

    return vow.all(nodes.map(function(node) {
        if(!_.isObject(node.source)) {
            return vow.resolve();
        }

        return vow.all(Object.keys(node.source).map(function(lang) {
            return vow.all([
                loadMDFile(node, lang),
                setUpdateDate(node, lang),
                checkForBranch(node, lang)
            ]);
        }));
    })).then(function() {
        obj.docs = compactCollected.apply(collected);
        return obj;
    });
};

/**
 * Analyze meta information for node
 * @param collected - {Object} hash of collected data
 * @param node - {BaseNode} node
 * @returns {Object} collected
 */
function analyzeMeta(collected, node) {
    if(!_.isObject(node.source)) {
        return collected;
    }

    var source = node.source,
        hasContent = Object.keys(source).some(function (lang) {
            return source[lang] && source[lang].content;
        });

    !hasContent && (node.hidden = true);

    utility.getLanguages().forEach(function (lang) {
        if (!source[lang]) {
            logger.warn(util.format('source with lang %s does not exists for node with url %s', lang, node.url), module);
            source[lang] = null;
            return;
        }

        source[lang] = new Meta(source[lang], lang, collected);
    });
    node.source = source;
    return collected;
}

/**
 * Loads *.md file for source of node
 * @param node - {Object} node of sitemap model
 * @param lang - {String} language key
 * @returns {Vow.promise}
 */
function loadMDFile(node, lang) {
    var s = node.source[lang],
        onError = function(md) {
            var errorMsg = (!md || !md.res) ?
                'markdown with lang %s does not exists for node %s' :
                'markdown for lang %s contains errors for node %s';
            errorMsg = util.format(errorMsg, lang, node.url);
            logger.error(errorMsg, module);
            return vow.reject(errorMsg);
        };

    if(!s || !s.repo) {
        return vow.resolve(null);
    }

    return providers.getProviderGhApi().load({ repository: s.repo })
        .then(function(md) {
            try {
                node.source[lang].url = s.content;
                node.source[lang].content = utility.mdToHtml(
                    (new Buffer(md.res.content, 'base64')).toString(), { renderer: renderer.getRenderer() });
            }catch(err) {
                return onError(md);
            }
        })
        .fail(function() {
            return onError();
        });
}

/**
 * Sets update date by date of latest commit
 * @param node - {Object} node of sitemap model
 * @param lang - {String} language key
 * @returns {Vow.promise}
 */
function setUpdateDate(node, lang) {
    var s = node.source[lang],
        repository;
    if(!s || !s.repo || s.editDate) {
        return vow.resolve(null);
    }

    repository = s.repo;

    return providers.getProviderGhApi().getCommits({
            repository: _.extend(repository, { sha: repository.ref })
        })
        .then(function(res) {
            if(!res || !res[0]) {
                logger.warn(util.format('can not get commits for %s %s %s %s',
                    repository.user, repository.repo, repository.ref, repository.path), module);
                return;
            }

            s.editDate = (new Date(res[0].commit.committer.date)).getTime();
        });
}

/**
 * Checks branch is branch and not tag
 * in opposite case the prose io link will be dropped
 * @param node - {Object} node of sitemap model
 * @param lang - {String} language key
 * @returns {Vow.promise}
 */
function checkForBranch(node, lang) {
    var s = node.source[lang],
        repository;

    if(!s || !s.repo) {
        return vow.resolve(null);
    }

    repository = s.repo;

    return providers.getProviderGhApi().isBranchExists({
            repository: _.extend(repository, { branch: repository.ref })
        })
        .then(function(exists) {
            if(exists) return;

            return providers.getProviderGhApi().getDefaultBranch({ repository: repository })
                .then(function(branch) {
                    repository.ref = branch;
                    repository.prose = s.generateProseUrl();
                });
        });
}

/**
 * Remove undefined, null or empty string values from authors, translators and tags collections
 * Remove repeated values
 */
function compactCollected() {
    this.authors = utility.uniqCompact(this.authors);
    this.translators = utility.uniqCompact(this.translators);

    Object.keys(this.tags).forEach(function(lang) {
        this.tags[lang] = utility.uniqCompact(this.tags[lang]);
    }, this);
    return this;
}

