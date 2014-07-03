var u = require('util'),

    _ = require('lodash'),
    md = require('marked'),
    semver = require('semver');

/**
 * Compile *.md files to html with marked module
 * @param content - {String} content of *.md file
 * @param config - {Object} configuration object
 * @returns {String} html string
 */
exports.mdToHtml = function(content, config) {
    return md(content, _.extend({
        gfm: true,
        pedantic: false,
        sanitize: false
    }, config));
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
 * Sort library versions function
 * @param a - {String} first tag value
 * @param b - {String} second tag value
 * @returns {Number}
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

/**
 * Remove circular references for parent nodes
 * for get ability to save sitemap object to json file
 * @param tree - {Object} sitemap object with removed circular references
 * @returns {Object}
 */
exports.removeCircularReferences = function(tree) {
    var traverseTreeNodes = function(node) {
        if(node.parent) {
            node.parent = node.parent.id;
        }

        if(node.items) {
            node.items = node.items.map(function(item) {
                return traverseTreeNodes(item);
            });
        }

        return node;
    };

    return tree.map(function(item) {
        return traverseTreeNodes(item);
    });
};

/**
 * Find node(s) which satisfy to criteria function
 * @param sitemap - {Object} sitemap model object
 * @param criteria - {Function} criteria function
 * @param onlyFirst - {Boolean} flag for find only first node
 * @returns {*}
 */
exports.findNodesByCriteria = function(sitemap, criteria, onlyFirst) {

    var result = [];

    if(!_.isObject(sitemap)) {
        return result;
    }

    if(!_.isFunction(criteria)) {
        return result;
    }

    var isFound = function() {
            return onlyFirst && result.length;
        },
        traverseTreeNodes = function(node) {
            if(criteria.apply(node)) {
                result.push(node);
            }

            if(!isFound() && node.items) {
                node.items.forEach(function(item) {
                    traverseTreeNodes(item);
                });
            }
        };

    sitemap.forEach(function(node) {
        if(isFound()) {
            return;
        }
        traverseTreeNodes(node);
    });

    return onlyFirst ? result[0] : result;
};
