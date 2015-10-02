modules.define('js-beautify', function(provide) {

/*borschik:include:../../../../libs/js-beautify/js/lib/beautify.js*/
/*borschik:include:../../../../libs/js-beautify/js/lib/beautify-html.js*/

provide({
    js: window.js_beautify,
    html: window.html_beautify
});

});
