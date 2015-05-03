modules.define('content', ['functions__throttle', 'i-bem__dom', 'jquery'], function (provide, throttle, BEMDOM, $) {

provide(BEMDOM.decl(this.name, {

    onSetMod: {
        js: {
            inited: function () {
                this.countExamples = this.findBlocksInside('block-example').length;
                this.count = 0;
                this._content = this.findBlockInside('content').domElem;

                var onScroll = throttle(
                    function () { this.setMod(this.elem('arrow-up'), 'visible', this.domElem.scrollTop() > 100); },
                    100
                );

                this.bindTo('scroll', onScroll);
            }
        }
    },

    _hasAnchorUrl: function () {
        return /\w*#\w+/.test(window.location.href);
    },

    _scrollToExample: function () {
        var _this = this,
            anchor = window.location.hash;

        if (!anchor) return;

        anchor = $(anchor);
        if (!anchor.length) return;

        var examplePosTop = $(anchor).position().top;

        // hack for skipping default browser actions with anchor
        setTimeout(function () {
            _this.domElem.scrollTop(examplePosTop);
        }, 500);
    },

    _iframesLoaded: function () {
        this.count++;
        if (this.countExamples === this.count) {
            this._scrollToExample();
        }
    },

    _pageScrollTop: function () {
        this._content.scrollTop(0);
    }

}, {
    live: function () {
        var ptp = this.prototype;

        if (ptp._hasAnchorUrl()) {
            this.liveInitOnBlockInsideEvent('iframeLoaded', 'block-example', ptp._iframesLoaded);
        }

        this.liveBindTo('arrow-up', 'pointerclick', function () {
            this._pageScrollTop();
        });

        return false;
    }
}));

});
