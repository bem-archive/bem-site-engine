modules.define('search-form', ['i-bem__dom'], function (provide, BEMDOM) {
    provide(BEMDOM.decl(this.name, {
        onSetMod: {
            js: {
                inited: function () {
                    this._input = this.findBlockInside('input', 'input');
                }
            }
        },

        activate: function () {
            var _this = this;

            setTimeout(function () {
                _this._input.setMod('focused', true);
            }, 500);
        }
    }));
});
