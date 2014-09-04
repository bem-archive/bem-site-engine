modules.define('i-bem__dom', ['jquery'], function(provide, $, BEMDOM) {

BEMDOM.decl('block-example', {

    onSetMod: {
        'js' : {
            'inited': function() {
                var self = this;

                this.bindTo('source-switcher', 'pointerclick', function(e) {
                    e.preventDefault();

                    var target = $(e.target),
                        typeSource = this.getMod(target, 'type');

                    if(self._typeSource && self._typeSource !== typeSource) {
                        self
                            .delMod(self.elem('source-switcher'), 'active')
                            .delMod(self.elem('source-item'), 'visible');
                    }

                    self._typeSource = typeSource;

                    self.toggleSource(typeSource);

                    if(typeSource === 'html') {
                        self._getHtml(self.elemParams(target).urlBemhtml);
                    }

                    if(typeSource === 'bemjson') {
                        self.loadIframe('source-code');
                    }
                });

                this.loadComplete = {};
            }
        }
    },

    changeHeight: function(el) {
        var iframe = this.elem(el),
            doc = iframe[0].contentDocument || iframe[0].contentWindow && iframe[0].contentWindow.document,
            height;

        if (!doc) return;

        height = doc.documentElement.scrollHeight || doc.body.scrollHeight;

        if(el === 'source-code') {
            // fix visible scroll
            height += 5;
        }

        if (this._actualHeight !== height) {
            iframe.attr('height', height);
            this._actualHeight = height;
        }
    },

    toggleSource: function(type) {
        this
            .toggleMod(this.elem('source-switcher', 'type', type), 'active', 'yes', '')
            .toggleMod(this.elem('source-item', 'type', type), 'visible', true, '');
    },

    _getHtml: function(url) {
        $.ajax({ url: url, dataType: 'text', context: this })
            .done(function(html) {
                html += ' ';
                this.elem('source-code', 'type', 'html').text(html);
            })
            .fail(function(error) { console.log('error', error); });
    },

    loadIframe: function(el) {
        if(this.loadComplete[el]) return;

        var _this = this,
            iframe = _this.elem(el),
            url = iframe.data('url'),
            isLive = (el === 'live');

        isLive && this._toggleSpin();

        iframe.attr('src', url);

        iframe.load(function() {
            isLive && _this._toggleSpin();

            _this.changeHeight(el);

            _this.loadComplete[el] = true;
        });
    },

    _toggleSpin: function() {
        this.findBlockInside('live-spin', 'spin').toggleMod('progress', true, '');
    }

});

provide(BEMDOM);

});
