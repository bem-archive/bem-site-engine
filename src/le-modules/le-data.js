'use strict';

var https = require('https'),
    u = require('util'),
    path = require('path'),

    api = require('github'),
    vow = require('vow'),
    fs = require('vow-fs'),
    _ = require('lodash'),

    util = require('../util'),
    logger = require('../logger')(module),
    config = require('../config'),

    gitPrivate = null,
    gitPublic = null;

var peopleHash = {},
    collectedAuthors = [],
    collectedTranslators = [],
    collectedTags = [];

module.exports = {

    /**
     * initialize github API
     */
    init: function() {
        logger.info('Init');

        var publicConfig = _.extend(config.get('github:public'), config.get('github:common')),
            privateConfig = _.extend(config.get('github:private'), config.get('github:common'));

        gitPublic = new api(publicConfig);
        gitPrivate = new api(privateConfig);

        gitPublic.authenticate(config.get('github:auth'));

        return this;
    },

    /**
     * Loads all resources by values of idHash
     * @returns {*}
     */
    loadDataForNodes: function(nodesWithSource) {
        logger.info('Load all resources start');

        var promises = nodesWithSource.map(function(node){
            logger.silly('Load source for node with url %s %s', node.url, node.source);

            return vow
                .allResolved({
                    metaEn: getDataByGithubAPI(getRepoFromSource(node.source, 'en.meta.json')),
                    mdEn: getDataByGithubAPI(getRepoFromSource(node.source, 'en.md')),
                    metaRu: getDataByGithubAPI(getRepoFromSource(node.source, 'ru.meta.json')),
                    mdRu: getDataByGithubAPI(getRepoFromSource(node.source, 'ru.md'))
                })
                .then(function(value) {
                    var _def = vow.defer();

                    node.source = {
                        en: getSourceFromMetaAndMd(value.metaEn._value, value.mdEn._value),
                        ru: getSourceFromMetaAndMd(value.metaRu._value, value.mdRu._value)
                    };

                    _def.resolve(node);
                    return _def.promise();
                });
        });

        return vow.allResolved(promises).then(loadPeople);
    },

    reloadAll: function() {
        logger.info('Reload all resources start');
        //TODO implement this
    },

    reload: function(source) {
        logger.info('Reload resource %s start', source);
        //TODO implement this
    },

    getPeople: function() {
        return peopleHash;
    },

    getAuthors: function() {
        return collectedAuthors;
    },

    getTranslators: function() {
        return collectedTranslators;
    },

    getTags: function() {
        return collectedTags;
    }
};

/**
 * Transform https url of source into repo object suitable for github api using
 * @param source - {String} https url of source block on github
 * @param extension - {String} file extension
 * @returns {Object} with fields:
 * - user {String} name of user or organization which this repository is belong to
 * - repo {String} name of repository
 * - ref {String} name of branch
 * - path {String} relative path from the root of repository
 * - block {String} name of block
 */
var getRepoFromSource = function(source, extention) {

    var repoData = (function(_source) {
        var re = /^https?:\/\/(.+?)\/(.+?)\/(.+?)\/tree\/(.+?)\/(.+\/(.+))/,
            parsedSource = _source.match(re);
            return {
                host: parsedSource[1],
                user: parsedSource[2],
                repo: parsedSource[3],
                ref: parsedSource[4],
                path: parsedSource[5],
                block: parsedSource[6]
            };
    })(source);

    var result = _.extend(repoData, {path: u.format('%s/%s.%s', repoData.path, repoData.block, extention)});

    logger.silly('repo meta user: %s repo: %s ref: %s path: %s', result.user, result.repo, result.ref, result.path);

    return result;
};

/**
 * Returns content of repository directory
 * @param repository - {Object} with fields:
 * - user {String} name of user or organization which this repository is belong to
 * - repo {String} name of repository
 * - ref {String} name of branch
 * - path {String} relative path from the root of repository
 * @returns {*}
 */
var getDataByGithubAPI = function(repository) {
    var def = vow.defer();
    gitPublic.repos.getContent(repository, function(err, res) {
        if (err || !res) {
            def.reject({res: null, repo: repository});
        }else {
            def.resolve({res: res, repo: repository});
        }
    });
    return def.promise();
};

/**
 * Loads people data from configured people repository
 * for all unique names of people blocks
 * @returns {*}
 */
var loadPeople = function() {
    logger.info('Load all people start');

    var peopleRepository = config.get('github:peopleRepository');

    return getDataByGithubAPI(peopleRepository).then(function(result) {
        var promises = result.res.map(function(people) {
            return vow
                .allResolved({
                    metaEn: getDataByGithubAPI(_.extend({}, peopleRepository,
                        { path: path.join(people.path, people.name + '.en.meta.json') })),
                    metaRu: getDataByGithubAPI(_.extend({}, peopleRepository,
                        { path: path.join(people.path, people.name + '.ru.meta.json') }))
                })
                .then(function(value) {
                    var _def = vow.defer(),
                        getPeopleFromMeta = function(meta) {
                            meta = (new Buffer(meta.res.content, 'base64')).toString();
                            meta = JSON.parse(meta);

                            //TODO can make some post-load operations here

                            return meta;
                        };

                    peopleHash[people.name] = {
                        en: getPeopleFromMeta(value.metaEn._value),
                        ru: getPeopleFromMeta(value.metaRu._value)
                    };

                    _def.resolve(peopleHash[people.name]);
                    return _def.promise();
                });
        });

        return vow.allResolved(promises);
    });
};

var getSourceFromMetaAndMd = function(meta, md) {
    try {
        var repo = meta.repo;

        logger.silly('loaded data from repo user: %s repo: %s ref: %s path: %s', repo.user, repo.repo, repo.ref, repo.path);

        meta = (new Buffer(meta.res.content, 'base64')).toString();
        meta = JSON.parse(meta);

        try {
            _.extend(repo, { path: md.res.path });
            md = (new Buffer(md.res.content, 'base64')).toString();
            md = util.mdToHtml(md);
        } catch(err) {
            logger.error('md content loading error user: %s repo: %s ref: %s path: %s', repo.user, repo.repo, repo.ref, repo.path);
            md = null;
        }

        meta.content = md;

        //parse date from dd-mm-yyyy format into milliseconds
        if(meta.createDate) {
            meta.createDate = util.dateToMilliseconds(meta.createDate);
        }

        //parse date from dd-mm-yyyy format into milliseconds
        if(meta.editDate) {
            meta.editDate = util.dateToMilliseconds(meta.editDate);
        }

        //remove empty strings from authors array
        if(_.has(meta, 'authors')) {
            if(_.isString(meta.authors)) {
                meta.authors = [meta.authors];
            }

            meta.authors = _.compact(meta.authors);
            collectedAuthors = _.union(collectedAuthors, meta.authors);
        }

        //remove empty strings from translators array
        if(_.has(meta, 'translators')) {
            if(_.isString(meta.translators)) {
                meta.translators = [meta.translators];
            }

            meta.translators = _.compact(meta.translators);
            collectedTranslators = _.union(collectedTranslators, meta.translators);
        }

        if(_.has(meta, 'tags')) {
            collectedTags = _.union(collectedTags, meta.tags);
        }

        /** fallbacks **/

        //TODO  remove this type hack later after sources meta refactoring!
        if(_.isArray(meta.type)) {
            if(meta.type.indexOf('authors') !== -1 || meta.type.indexOf('translators') !== -1) {
                meta.type = 'people';
            }else if(meta.type.indexOf('page') !== -1) {
                meta.type = 'page';
            }else {
                meta.type = 'post';
            }
        }else if(_.isString(meta.type)){
            if(meta.type === 'authors' || meta.type === 'translators') {
                meta.type = 'people';
            }else if(meta.type === 'page') {
                meta.type = 'page';
            }else {
                meta.type = 'post';
            }
        }

        //TODO  remove this root hack later after sources meta refactoring!
        //TODO  remove this categories hack later after sources meta refactoring!
        //TODO  remove this order hack later after sources meta refactoring!
        //TODO  remove this url hack later after sources meta refactoring!
        meta.root && delete meta.root;
        meta.categories && delete meta.categories;
        meta.order && delete meta.order;
        meta.url && delete meta.url;
        /** end of fallbacks **/

            //set repo information
        meta.repo = {
            issue: u.format("https://%s/%s/%s/issues/new?title=Feedback+for+\"%s\"",
                repo.host, repo.user, repo.repo, meta.title),
            prose: u.format("http://prose.io/#%s/%s/edit/%s/%s",
                repo.user, repo.repo, repo.ref, repo.path)
        };

    } catch(err) {
        logger.error('meta information loading error user: %s repo: %s ref: %s path: %s', repo.user, repo.repo, repo.ref, repo.path);
        return null;
    }

    return meta;
};







