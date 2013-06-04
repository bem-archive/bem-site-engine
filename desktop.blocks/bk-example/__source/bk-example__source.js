modules.define(
    'i-bem__dom',
    ['jquery'],
    function(provide, $, DOM) {

// TODO: использовать islands-page/slide
// TODO: `BEMHTML.apply()`
function buildSourceCodeHtml(data) {
    return $('<div class="bk-example__source-code">' +
        '<pre class="code code_type_bemjson"><code>' + data + '</code></pre>' +
        '</div>');
}

DOM.decl('bk-example', {

    onSetMod : {

        js : {
            inited : function() {
                this.__base.apply(this, arguments);

                this._provider = null;
                this._source = null;

                this.findBlockOn('source-trigger', 'check-button').on('change',
                    this.toggleSource, this);
            },

            '' : function() {
                this._source = null;
                this._provider = null;

                this.__base.apply(this, arguments);
            }
        }

    },

    toggleSource : function(e) {
        var trigger = e.target;
        trigger.hasMod('checked')?
            this.showSource() : this.hideSource();
    },

    showSource : function() {
        if(!this._source) {
            return this._getSource(this.showSource);
        }
        return this.setMod(this._source, 'visible', 'yes');
    },

    hideSource : function() {
        if(!this._source) {
            return this;
        }
        return this.delMod(this._source, 'visible');
    },

    _getSource : function(onSuccess) {
        this._getProvider()
            .get({},
                function(source) {
                    source = buildSourceCodeHtml(source);

                    this._source = this.findElem(source, 'source-code');

                    DOM.after(this.domElem, source);

                    onSuccess.call(this);
                },
                function() {
                    console.error(arguments);
                });

        return this;
    },

    _getProvider : function() {
        if(this._provider) {
            return this._provider;
        }

        var url = this.elemParams('source-trigger').url;
        return this._provider = DOM.create('i-request_type_ajax', {
            url : url,
            dataType : 'text',
            callbackCtx : this
        });
    }

});

provide(DOM);

});
