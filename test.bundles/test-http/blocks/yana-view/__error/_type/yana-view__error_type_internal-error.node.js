modules.define(
    'yana-view',
    function(provide, View) {

provide(View.decl('internal-error', {

    render : function() {
        var out = this.__base.apply(this, arguments),
            err = this.params.error;

        if(err.stack) {
            return ''.concat(
                err.stack,
                out
            );
        }

        return out;
    }

}));

});
