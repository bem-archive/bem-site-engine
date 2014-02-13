modules.define('i-bem__dom', ['jquery'], function(provide, $, BEMDOM) {

BEMDOM.decl('block-example', {

    onSetMod: {

        'js' : {

            'inited': function() {
                // var _this = this;

                // this.findElem('live').load(function() {
                //     // _this.changeHeight();
                // });
            }

        }

    },

    changeHeight: function() {
        var iframe = this.elem('live'),
            doc = iframe[0].contentDocument || iframe[0].contentWindow && iframe[0].contentWindow.document;

        if (!doc) return;

        var height = $(doc).height();

        if (this._actualHeight !== height) {
            iframe.attr('height', height);
            this._actualHeight = height;
        }
    },

    toggleSource: function() {
        this.toggleMod(this.elem('source-link'), 'active', 'yes', '');

        this.toggleMod(this.elem('source'), 'visible', 'yes', '');
    }

}, {
    live: function() {

        this.liveBindTo('source-link', 'click', function(e) {
            e.preventDefault();
            this.toggleSource();
        });

        return false;
    }
});

provide(BEMDOM);

});
