modules.define('i-bem__dom', ['jquery'], function(provide, $, BEMDOM) {

BEMDOM.decl({ block: 'menu-list', modName: 'type', modVal: 'level' }, {
    onSetMod: {
        js: {
            inited: function() {
                var _this = this;

                _this.__base();

                if(_this.getStorage('level')) {
                    _this
                        ._setSelectFromStorage()
                        .showLevel();
                }

                this.bindTo('select', 'change', function(e) {
                    var level = $(e.currentTarget).val();

                    _this.showLevel(level);
                });
            }
        }
    },

    showLevel: function(level) {

        var _this = this,
            groups = _this.elem('group');


        if (!level) {
            var level = _this.getStorage('level');
        }

        _this.setStorage('level', level);

        if(level === 'all levels') {
            _this.delMod(groups, 'hide');

            return _this;
        }

        groups.each(function(idx, el) {
            var group = $(el);

            _this.setMod(group, 'hide', 'yes');

            if (group.data('level') === level) {
                _this.delMod(group, 'hide');
            }
        });

        return _this;
    },

    _setSelectFromStorage: function() {
        var _this = this,
            level = _this.getStorage('level');

         _this.elem('select').val(level);

        return _this;
    }
});

provide(BEMDOM);

});
