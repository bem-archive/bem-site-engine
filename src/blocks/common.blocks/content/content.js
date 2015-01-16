modules.define('content', ['i-bem__dom', 'jquery'], function (provide, BEMDOM, $) {

provide(BEMDOM.decl(this.name, {

    onSetMod: {
        js: {
            inited: function () {
                this.countExamples = this.findBlocksInside('block-example').length;
                this.count = 0;
            }
        }
    },

    _hasAnchorUrl: function () {
        return /\w*#\w+/.test(window.location.href);
    },

    _scrollToExample: function () {
        var _this = this,
            anchor = window.location.hash,
            examplePosTop = $(anchor).position().top,
            tabsHeight = this.findBlockInside('tabs').elem('header').height();

        // hack for skipping default browser actions with anchor
        setTimeout(function () {
            _this.domElem.scrollTop(examplePosTop - tabsHeight);
        }, 500);
    },

    _iframesLoaded: function () {
        this.count++;
        if (this.countExamples === this.count) {
            this._scrollToExample();
        }
    }

}, {
    live: function () {
        var ptp = this.prototype;

        if (ptp._hasAnchorUrl()) {
            this.liveInitOnBlockInsideEvent('iframeLoaded', 'block-example', ptp._iframesLoaded);
        }

        return false;
    }
}));

});
