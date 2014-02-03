modules.define(
    'i-bem__dom',
    ['jquery', 'dom', 'events'],
    function(provide, $, dom, events, BEMDOM) {

BEMDOM.decl('page', {

    _onClick: function() {
        this.toggleMod('fullscreen');
    },
    }, {
    live: function() {
        this.liveBindTo('fullscreen', 'click', function() { this._onClick() });
    }
});

provide(BEMDOM);

});
