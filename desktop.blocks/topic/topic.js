modules.define('i-bem__dom', function(provide, DOM) {

DOM.decl({ block : 'topic', modName : 'type', modVal : 'blocks' }, {

    onSetMod : {

        js : {

            inited : function() {
                this._bindReadmeSwitcher();                                
            },

            '' : function() {
               
            }
        }

    },

    _bindReadmeSwitcher : function() {
        
        var switcher = this.findBlockInside('readme-switcher', 'check-button');

        switcher.on('change', function(e) {
            this.toggleMod(this.elem('readme'), 'visible', 'yes', '', switcher.isChecked());
        }, this);
        
    } 
});

provide(DOM);

});
