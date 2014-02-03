/* global DocumentTouch */
modules.define(
    'i-bem__dom',
    ['jquery', 'dom', 'events'],
    function(provide, $, dom, events, BEMDOM) {

BEMDOM.decl('page', {

    onSetMod: {
        js: {
            inited: function() {
                !(this._isTouch()) && this._resizePostContent()
                    .bindToWin('resize', this._resizePostContent.bind(this));
            }
        }
    },
    _onClick: function() {
        this.toggleMod('fullscreen');
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
    }
    },{
    live: function() {
        this.liveBindTo('fullscreen', 'click', function() { this._onClick() });
    }
});

provide(BEMDOM);

});
