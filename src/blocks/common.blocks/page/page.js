modules.define('i-bem__dom', function(provide, BEMDOM) {

BEMDOM.decl('page', {

    _onClick: function() {
        this.toggleMod('fullscreen');
    }
},
{
    live: function() {
        this.liveBindTo('fullscreen', 'click', function() {
            this._onClick();
        });
    }
});

provide(BEMDOM);

});
