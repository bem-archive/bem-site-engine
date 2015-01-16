modules.define('i-bem__dom', ['jquery', 'next-tick'], function (provide, $, nextTick, BEMDOM) {

BEMDOM.decl('menu-list', {
    onSetMod: {
        js: {
            inited: function () {
                var _this = this;

                /* In the case when a bem block menu-list has a filter by levels
                 * and you must wait until the document is loaded completely,
                 * to calculate the height of the menu after their hide
                 */
                nextTick(function () {
                    _this._setPosActiveElem();
                });
            }
        }
    },

    /**
     * @private
     * [Shows the active menu item is visible to the viewport]
     */
    _setPosActiveElem: function () {
        var el = this.elem('link', 'active', true);

        if (!this.hasMod(el, 'active', true)) {
            return;
        }

        var elPosTop = el.offset().top,
            elHeight = el.outerHeight(true),

            viewportHeight = BEMDOM.doc.outerHeight(true) - elHeight,
            viewportCenter = Math.round((viewportHeight / 2) - elHeight);

        if (elPosTop >= viewportHeight) {
            var menuScrollTop = (elPosTop - viewportHeight) + viewportCenter;

            this.domElem.scrollTop(menuScrollTop);
        }
    }
});

provide(BEMDOM);

});
