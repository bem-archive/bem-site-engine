modules.define('i-bem__dom', function(provide, DOM) {

provide(DOM.decl('topic', {

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
        if(this.hasMod('type', 'blocks')) { 
            var switcher = this.findBlockInside('readme-switcher', 'check-button');

            switcher.on('change', function(e) {
                this.toggleMod(this.elem('readme'), 'visible', 'yes', '', switcher.isChecked());
            }, this);
        }
    } 
}));

});
