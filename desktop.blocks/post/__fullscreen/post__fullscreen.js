modules.define('i-bem__dom', function(provide, BEMDOM) {

BEMDOM.decl('post', {

    onSetMod : {
        'js' : {
            'inited' : function() {
                var _this = this,
                    fullscreen = _this.elem('fullscreen');

                fullscreen.on('click', function(){
                    _this.toggleMod('fullscreen', 'yes');
                });
            }
        }
    },

});

provide(BEMDOM);

});
