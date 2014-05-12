modules.define('search-action', ['i-bem__dom', 'jquery'], function(provide, BEMDOM, $) {
    provide(BEMDOM.decl(this.name, {
        onSetMod: {
            js: {
                inited: function() {
                    this._onClick();

                    this._onKey();
                }
            }
        },

        _onClick: function() {
            var _this = this;

            _this.bindToDoc('pointerclick', function(e) {
                var target = $(e.target);

                _this._toggle(target);
            });
        },

        _onKey: function() {
            var _this = this;

            _this.bindToDoc('keyup', function(e) {
                if(e.which === 18) {
                    _this.isKeydownAlt = true;

                } else if (e.which === 70 && _this.isKeydownAlt) {
                    _this.isKeydownAlt = false;
                    this._showForm(this.findBlockInside('input'));

                } else if(e.which === 27) {
                    _this._hideForm();
                }
            });
        },

        _toggle: function(target) {
            var icon = this.elem('icon'),
                input = this.findBlockInside('input');

            if(target.is(icon) || input.containsDomElem(target)) {
                this._showForm(input);
            } else {
                this._hideForm();
            }
        },

        _showForm: function(input) {
            this.delMod('form');
            input.setMod('focused', true);
        },

        _hideForm: function() {
            this.setMod('form', 'hidden');
        }
    }));
});
