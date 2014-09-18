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
        var specials = null;
        /* jshint ignore:start */
        specials = ['-','[',']','/','{','}','(',')','*','+','?','.','\\','^','$','|','\ ','\'','\"'];
        /* jshint ignore:end */

        options = options || {};
        options.headerPrefix = options.headerPrefix || '';

        return '<h' + level + ' id="' + options.headerPrefix +
            raw.replace(RegExp('[' + specials.join('\\') + ']', 'g'), '-') + '">' +
            text + '</h' + level + '>\n';
    };

    // Fix(hidden) post scroll, when it contains wide table
    renderer.table = function(header, body) {
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
    renderer.html = function(source) {
        var newHtml = source.replace(/<table>/, '<div class="table-container"><table>');
        return newHtml.replace(/<\/table>/, '</table></div>');
    };

    return renderer;
}

exports.getRenderer = function() {
    return renderer || createRenderer();
};
