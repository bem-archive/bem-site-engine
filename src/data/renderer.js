var marked = require('marked'),
    renderer,
    usedAnchors = {};

/**
 * Returns an anchor for a given header
 * @param {String} headerText
 * @returns {String}
 */
function getAnchor(headerText) {
    var anchor = headerText.replace(/( )/g, '-'),
        allowedChars = new RegExp('[A-Za-zА-Яа-яЁё0-9_\\- ]', 'g');

    anchor = anchor.match(allowedChars) || [];

    var _anchor = '';
    for (var i = 0; i < anchor.length; i++) {
        _anchor += anchor[i].match(/[A-Z]/) ? anchor[i].toLowerCase() : anchor[i];
    }

    return _anchor;
}

function createRenderer() {
    renderer = new marked.Renderer();

    /**
     * Fix marked issue with cyrillic symbols replacing.
     *
     * @param {String} text test of header
     * @param {Number} level index of header
     * @param {String} raw
     * @param {Object} options options
     * @returns {String} result header string
     */
    renderer.heading = function (text, level, raw, options) {
        var anchor;

        options = options || {};
        options.headerPrefix = options.headerPrefix || '';

        anchor = options.headerPrefix + getAnchor(raw);

        if (usedAnchors.hasOwnProperty(anchor)) {
            anchor += '-' + usedAnchors[anchor]++;
        } else {
            usedAnchors[anchor] = 1;
        }

        return '<h' + level + ' id="' + anchor + '"><a href="#' + anchor + '" class="anchor"></a>' +
            text + '</h' + level + '>\n';
    };

    // Fix(hidden) post scroll, when it contains wide table
    renderer.table = function (header, body) {
        return '<div class="table-container">' +
            '<table>\n' +
            '<thead>\n' +
            header +
            '</thead>\n' +
            '<tbody>\n' +
            body +
            '</tbody>\n' +
            '</table>\n' +
            '</div>';
    };

    // Add container for inline html tables
    renderer.html = function (source) {
        var newHtml = source.replace(/<table>/, '<div class="table-container"><table>');
        return newHtml.replace(/<\/table>/, '</table></div>');
    };

    return renderer;
}

exports.getRenderer = function () {
    return renderer || createRenderer();
};
