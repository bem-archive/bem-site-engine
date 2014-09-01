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
            doc = iframe[0].contentDocument || iframe[0].contentWindow && iframe[0].contentWindow.document,
            height;

        if (!doc) return;

        height = doc.documentElement.scrollHeight || doc.body.scrollHeight;

        if(el === 'source-code') {
            // fix visible scroll
            height += 5;
        }

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
            url = iframe.data('url'),
            isLive = (el === 'live');

        isLive && this._toggleSpin();

        iframe.attr('src', url);

        iframe.load(function() {
            isLive && _this._toggleSpin();

            _this.changeHeight(el);

            _this.loadComplete[el] = true;
        });
    },

    _toggleSpin: function() {
        this.findBlockInside('live-spin', 'spin').toggleMod('progress', true, '');
    }

}, {
    live: function() {

        this.liveBindTo('source-switcher', 'pointerclick', function(e) {
            e.preventDefault();

            this.toggleSource();

            this.loadIframe('source-code');
        });

        return false;
    }
});

provide(BEMDOM);

});
