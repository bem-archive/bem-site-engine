var u = require('util'),

    _ = require('lodash'),
    md = require('marked'),
    semver = require('semver'),

    logger = require('./logger')(module);

exports.mdToHtml = function(content) {
    return md(content, {
        gfm: true,
        pedantic: false,
        sanitize: false
    });
};

/**
 * Return compiled date in milliseconds from date in dd-mm-yyyy format
 * @param  {String} dateStr - staring date in dd-mm-yyy format
 * @return {Number} date in milliseconds
 */
exports.dateToMilliseconds = function(dateStr) {
    var re = /[^\w]+|_+/,
        date = new Date(),
        dateParse = dateStr.split(re),
        dateMaskFrom = 'dd-mm-yyyy'.split(re);

    dateMaskFrom.forEach(function(elem, indx) {
        switch (elem) {
            case 'dd':
                date.setDate(dateParse[indx]);
                break;
            case 'mm':
                date.setMonth(dateParse[indx] - 1);
                break;
            default:
                if (dateParse[indx].length === 2) {
                    if(date.getFullYear() % 100 >= dateParse[indx]) {
                        date.setFullYear('20' + dateParse[indx]);
                    }else {
                        date.setFullYear('19' + dateParse[indx]);
                    }
                }else {
                    date.setFullYear(dateParse[indx]);
                }
        }
    });

    return date.valueOf();
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
exports.getRepoFromSource = function(source, extention) {

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

    logger.verbose('get repo from source user: %s repo: %s ref: %s path: %s',
        result.user, result.repo, result.ref, result.path);

    return result;
};

/**
 * Sort library versions function
 * @param a - {String} first tag value
 * @param b - {String} second tag value
 * @returns {number}
 */
exports.sortLibraryVerions = function(a, b) {


    var BRANCHES = ['master', 'dev'],
        VERSION_REGEXP = /^\d+\.\d+\.\d+$/;

    if(BRANCHES.indexOf(a) !== -1) {
        return 1;
    }

    if(BRANCHES.indexOf(b) !== -1) {
        return -1;
    }

    a = semver.clean(a);
    b = semver.clean(b);

    if(VERSION_REGEXP.test(a) && VERSION_REGEXP.test(b)) {
        return semver.rcompare(a, b);
    }

    if(VERSION_REGEXP.test(a)) {
        return -1;
    }

    if(VERSION_REGEXP.test(b)) {
        return 1;
    }

    if(semver.valid(a) && semver.valid(b)) {
        return semver.rcompare(a, b);
    }

    if(semver.valid(a)) {
        return -1;
    }

    if(semver.valid(b)) {
        return 1;
    }

    return a - b;
};
