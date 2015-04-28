modules.define(
    'search-form',
    ['functions__debounce', 'events__channels'],
    function (provide, debounce, channels, SearchForm) {

    provide(SearchForm.decl({ block: this.name, modName: 'type', modVal: 'default' }, {
        onSetMod: {
            js: {
                inited: function () {
                    this.__base.apply(this, arguments);

                    this._freezeVal();
                    this._debounceChange = debounce(this._checkChange, 500, this);
                    this._input.bindTo('keyup', this._doChange.bind(this));

                    this.bindTo('submit', function (e) {
                        e.preventDefault();
                    });
                }
            }
        },

        _doChange: function (needDebounce) {
            needDebounce ? this._debounceChange() : this._checkChange();
        },

        _onChange: function (currentVal) {
            channels('search').emit('change:input', { text: currentVal });
        },

        _freezeVal: function () {
            this._val = this._input.getVal();
        },

        _checkChange: function () {
            var currentValue = this._input.getVal();

            if (currentValue.length > 1 && this._val !== currentValue) {
                this._freezeVal();
                this._onChange(currentValue);
            }
        }
    }));
});
