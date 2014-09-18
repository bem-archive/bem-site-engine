modules.define('i-bem__dom', ['jquery', 'zeroclipboard'], function(provide, $, zeroclipboard, BEMDOM) {

BEMDOM.decl('block-example', {

    onSetMod: {
        'js' : {
            'inited': function() {
                this.__base();

                this.setToClipboard();
            }
        }
    },

    setToClipboard: function() {
        var _this = this,
            copy;

        /* jshint ignore:start */
        ZeroClipboard.config({
            hoverClass: _this.params.copyHoverClass
        });


        copy = new ZeroClipboard(_this.elem('source-copy'));
        /* jshint ignore:end */

        copy.on('load', function(client) {

            client.on('dataRequested', function(client) {
                _this.getData(client);
            });

            client.on('complete', function() {
                _this.setMod(_this.elem('source-copy'), 'complete', 'yes');
                setTimeout(function() {
                    _this.delMod(_this.elem('source-copy'), 'complete');
                }, 1000);
            });

        });

        copy.on('noFlash wrongFlash', function() {
            _this.elem('source-copy').remove();
        });
    },

    getData: function(client) {
        var elemParams = this.elemParams('source-copy'),
            inlineBemjson = elemParams.inlineBemjson;

        if(inlineBemjson) {
            client.setText(inlineBemjson);
        } else {
            $.ajax({
                url: elemParams.urlBemjson,
                success: function(content) {
                    client.setText(content);
                },
                async: false
            });
        }
    }

});

provide(BEMDOM);

});
