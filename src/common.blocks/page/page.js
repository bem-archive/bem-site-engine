modules.define(
    'i-bem__dom',
    ['jquery', 'dom', 'events'],
    function(provide, $, dom, events, BEMDOM) {

BEMDOM.decl('page', {

    onSetMod : {
        'js' : {
            'inited' : function() {
                !(this._isTouch()) && this._resizePostContent()
                    .bindToWin('resize', this._resizePostContent.bind(this));
            }
        }
    },

    /*
     * Проверка тач-устройств (при обнаружении добавляется модификатор _touch_yes)
     * @private
     * @returns {Boolean}
     */
    _isTouch: function() {
        /* hotfix https://st.yandex-team.ru/BEM-1464
         * Touch detection idea by Modernizr
         */
        if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
            this.setMod('touch', 'yes');
            return true;
        }
        return false;
    },

    /*
     * Рассчет свободного места для контента поста
     * @private
     * @returns this;
     */
    _resizePostContent: function() {
        var windowW = BEMDOM.win.width();
            mainMenuW = this.findBlockInside('main-menu').domElem.width();
            menusW = this.findBlocksInside('menu').reduce(function(prev, item) {
                return prev + item.domElem.width();
            }, 0),
            post = this.findBlockInside({ block: 'post', modName: 'view', modVal: 'full' });

            post && post.domElem.width(windowW - mainMenuW - menusW - 30);

        return this;
    }
});

provide(BEMDOM);

});
