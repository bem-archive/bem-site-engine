modules.define('i-bem__dom', ['jquery'], function(provide, $, BEMDOM) {

BEMDOM.decl('page', {
    onSetMod: {
        js: {
            inited: function() {
                this._isTouch() && this.setMod('touch', 'yes');
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
        /* Touch detection idea by Modernizr */
        if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
            return true;
        }

        return false;
    }
},
{
    live: function() {
        this.liveBindTo('fullscreen', 'pointerclick', function() {
            this._onClick();
        });
    }
});

provide(BEMDOM);

});
