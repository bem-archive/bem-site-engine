modules.define('zeroclipboard', function(provide) {

/*borschik:include:../../../../libs/zeroclipboard/ZeroClipboard.min.js*/

ZeroClipboard.config({
    moviePath: '../../../../libs/zeroclipboard/ZeroClipboard.swf'
});

provide(ZeroClipboard);

});
