modules.define('menu-list', ['i-bem__dom', 'jquery'], function(provide, BEMDOM, $) {

    'use strict';

    provide(BEMDOM.decl({ block: 'menu-list', modName: 'type', modVal: 'level' }, {
        onSetMod: {
            js: {
                inited: function() {
                    this._selectLevel = this.findBlockInside('level-select', 'select');

                    this._selectLevel.on('change', this._showLevel, this);
                }
            }
        },

        _showLevel: function() {
            var self = this,
                $groups = this.elem('level-group'),
                level = this._selectLevel.getVal();

            this.delMod($groups, 'hide');

            if(level === 'all levels') {
                return false;
            }

            $groups.each(function(idx, el) {
                var $group = $(el);

                !($group.data('level') === level) && self.setMod($group, 'hide', 'yes');
            });

            return this;
        }
    }));
});
