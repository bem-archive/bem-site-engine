modules.define('menu-list', ['i-bem__dom', 'jquery'], function(provide, BEMDOM, $) {

    'use strict';

    provide(BEMDOM.decl({ block: 'menu-list', modName: 'type', modVal: 'level' }, {
        onSetMod: {
            js: {
                inited: function() {
                    this._selectLevel = this.findBlockInside('level-select', 'select');

                    if(window.localStorage.getItem('level')) this._setLevelFromStorage();

                    this._selectLevel.on('change', this._showLevel, this);
                }
            }
        },

        /**
         * Show level group(desktop, touch-pad, etc)
         * depends on the value in the level select
         * @private
         */
        _showLevel: function() {
            var self = this,
                $groups = this.elem('level-group'),
                level = this._selectLevel.getVal();

            this._saveLevelToStorage(level);

            this.delMod($groups, 'hide');

            if(level === 'all levels') {
                return false;
            }

            $groups.each(function(idx, el) {
                var $group = $(el);

                !($group.data('level') === level) && self.setMod($group, 'hide', 'yes');
            });
        },

        /**
         * Saves the passed level to window.localStorage
         * @param level
         * @private
         */
        _saveLevelToStorage: function(level) {
            var localStorage = window.localStorage;

            localStorage.setItem('level', level);
        },

        /**
         * Set level value from localStorage
         * set select value and show level group
         * @private
         */
        _setLevelFromStorage: function() {
            this._selectLevel.setVal(window.localStorage.getItem('level'));
            this._showLevel();
        }
    }));
});
