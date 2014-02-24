var u = require('util'),

    _ = require('lodash'),
    md = require('marked'),
    hl = require('highlight.js'),
    semver = require('semver'),

    logger = require('./logger')(module);

exports.mdToHtml = function(content) {
    var languages = {};

    return md(content, {
            gfm: true,
            pedantic: false,
            sanitize: false,
            highlight: function(code, lang) {
                if (!lang) {
                    return code;
                }
                var res = hl.highlight(function(alias) {
                    return {
                        'js' : 'javascript',
                        'patch': 'diff',
                        'md': 'markdown',
                        'html': 'xml',
                        'sh': 'bash'
                    }[alias] || alias;
                }(lang), code);

                languages[lang] = res.language;
                return res.value;
            }
        })
        .replace(/<pre><code class="lang-(.+?)">([\s\S]+?)<\/code><\/pre>/gm,
            function(m, lang, code) {
                return '<pre class="highlight"><code class="highlight__code ' + languages[lang] + '">' + code + '</code></pre>';
            }
        );
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
    a = semver.clean(a);
    b = semver.clean(b);

    if(semver.valid(a) !== null && semver.valid(b) !== null) {
        return semver.gt(a, b) ? 1 : (semver.lt(a, b) ? -1 : 0);
    }else if(semver.valid(a) !== null) {
        return 1;
    }else if(semver.valid(b) !== null) {
        return -1;
    }else {
        return a - b;
    }
};