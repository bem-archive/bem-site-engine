var vowFs = require('vow-fs'),
    md = require('marked'),
    hl = require('highlight.js'),
    logger = require('./logger')(module);

exports.createDirectory = function(dirName) {
    return vowFs.makeDir(dirName, false).fail(function(err) {
        logger.error('%s directory creation failed with error', dirName, err.message);
    });
};

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
