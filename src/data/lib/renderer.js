var md = require('marked');

var renderer;

function createRenderer() {
    renderer = new md.Renderer();

    /**
     * Fix marked issue with cyrillic symbols replacing
     * @param text - {String} test of header
     * @param level - {Number} index of header
     * @param raw
     * @param options - {Object} options
     * @returns {String} - result header string
     */
    renderer.heading = function(text, level, raw, options) {
        var specials = ['-','[',']','/','{','}','(',')','*','+','?','.','\\','^','$','|','\ ','\'','\"'];

        options = options || {};
        options.headerPrefix = options.headerPrefix || '';

        return '<h' + level + ' id="' + options.headerPrefix
            + raw.toLowerCase().replace(RegExp('[' + specials.join('\\') + ']', 'g'), '-') + '">'
            + text + '</h' + level + '>\n';
    };

    // Fix(hidden) post scroll, when it contains wide table
    renderer.table = function(header, body) {
        return '<div class="table-container">'
            + '<table>\n'
                + '<thead>\n'
                    + header
                + '</thead>\n'
                + '<tbody>\n'
                    + body
                + '</tbody>\n'
            + '</table>\n'
            + '</div>';
    };

    // Add container for inline html tables
    renderer.html = function(source) {
        var newHtml = source.replace(/<table>/, '<div class="table-container"><table>');
        return newHtml.replace(/<\/table>/, '</table></div>');
    };

    /**
     * Replace relative links in md documents to app route links or absolute links to github sources
     * @param href - {String} href string
     * @param title - {String} href title
     * @param text - {String} href text
     * @returns {String} result string for a link
     */
    /*
    renderer.link = function(href, title, text) {

        var buildLink = function(_href) {
                var out = '<a href="' + _href + '"';
                if(title) {
                    out += ' title="' + title + '"';
                }
                out += '>' + text + '</a>';
                return out;
            },
            isMailTo = /^mailto:/.test(href), //detect mailto links
            isAnchor = href.indexOf('#') == 0; //detect simple anchors


        if(isMailTo || isAnchor) {
            return buildLink(href);
        }

        // TODO: remove from docs and from here
        ///^github\.com/.test(href) && console.log('GITHUB.COM', href, repo.user, repo.repo, repo.ref, repo.path);

        //detect some strange links as github.com
        href = (/^github\.com/.test(href) ? 'https://' : '') + href;
        href = href.replace(/^\/\/github/, 'https://github');

        var hrefArr = href.split('#'), //extrude anchor from link
            href = hrefArr[0],
            anchor = hrefArr[1];

        //detect if link is native site link
        if(_.values(sourceRouteHash).indexOf(href.replace(/\/$/, '')) > -1) {
            return  buildLink(href + (anchor ? '#' + anchor : ''));
        }

        //fix some broken links as single ampersand
        //or links which begins from symbol (
        href = href.replace(/^&$/, '');
        href = href.replace(/^\(/, '');

        var _href;
        ['tree', 'blob'].some(function(item) {
            _href = href;

            if(!/^(https?:)?\/\//.test(href)) {
                _href = 'https://' + p.join(repo.host, repo.user, repo.repo, item, repo.ref,
                        href.indexOf('.') == 0 ? p.dirname(repo.path) : '', href.replace(/^\//, ''));
            }

            if(sourceRouteHash[_href]) {
                _href = sourceRouteHash[_href];
                return true;
            }

            var __href = _href + '/README.md';
            if(sourceRouteHash[__href]) {
                _href = sourceRouteHash[__href];
                return true;
            }

            return false;
        });

        href = _href;
        return  buildLink(href + (anchor ? '#' + anchor : ''));
    };
    */

    return renderer;
}

exports.getRenderer = function() {
    return renderer || createRenderer();
};
