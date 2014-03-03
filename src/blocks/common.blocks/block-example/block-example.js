modules.define('i-bem__dom', ['jquery'], function(provide, $, BEMDOM) {

BEMDOM.decl('block-example', {

    onSetMod: {
        'js' : {
            'inited': function() {
                this.loadComplete = {};
            }
        }

    },

    changeHeight: function(el) {
        var iframe = this.elem(el),
            doc = iframe[0].contentDocument || iframe[0].contentWindow && iframe[0].contentWindow.document;

        if (!doc) return;

        var height = $(doc).height();

        if (this._actualHeight !== height) {
            iframe.attr('height', height);
            this._actualHeight = height;
        }
    },

    toggleSource: function() {
        this
            .toggleMod(this.elem('source-link'), 'active', 'yes', '')
            .toggleMod(this.elem('source'), 'visible', 'yes', '');
    },

    loadIframe: function(el) {
        if(this.loadComplete[el]) return;

        var _this = this,
            iframe = _this.elem(el),
            url = iframe.data('url');

        iframe.attr('src', url);

        iframe.load(function() {
            _this.changeHeight(el);

            _this.loadComplete[el] = true;
        });
    }

}, {
    live: function() {

        this.liveBindTo('source-link', 'pointerclick', function(e) {
            e.preventDefault();

            this.toggleSource();

            this.loadIframe('source-code');
        });

        return false;
    }
});

provide(BEMDOM);

});
