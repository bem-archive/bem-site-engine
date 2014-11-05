modules.define('search-panel', ['i-bem__dom', 'jquery', 'events__channels'], function(provide, BEMDOM, $, channels) {
    provide(BEMDOM.decl(this.name, {
        onSetMod: {
            js: {
                inited: function() {
                    this._spin = this.findBlockInside('spin', 'spin');
                    this._form = this.findBlockInside({ block: 'search-form', modName: 'type', modVal: 'default' });

                    channels('search').on('change:input', this._sendRequest, this);
                }
            },

            loading: function(modName, modVal) {
                this._spin.setMod('progress', modVal);
                this.setMod(this.elem('content'), 'loading', modVal);
            },

            state: {
                open: function() {
                    this._form.activate();
                }
            }
        },

        _toggle: function() {
            this.setMod('state', 'open');
        },

        _sendRequest: function(e, data) {
            this._abortRequest();
            this.setMod('loading');

            this._xhr = $.ajax({
                type: 'GET',
                dataType: 'html',
                url: '/search?text=' + data.text,
                context: this,
                success: this._onSuccess
            });
        },

        _abortRequest: function() {
            this._xhr && this._xhr.abort();
        },

        _onSuccess: function(result) {
            this._updateContent(result);
            this.delMod('loading');
        },

        _updateContent: function(html) {
            BEMDOM.update(this.elem('content'), html);
        }
    }));
});
