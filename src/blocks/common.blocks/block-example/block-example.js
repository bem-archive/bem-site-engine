modules.define('block-example', ['i-bem__dom', 'jquery', 'dropdown', 'js-beautify', 'highlightjs'], function (provide, BEMDOM, $, Dropdown, beautify, hljs) {

provide(BEMDOM.decl(this.name, {

    onSetMod: {
        'js': {
            'inited': function () {
                var _this = this;

                this.bindTo('source-switcher', 'pointerclick', function (e) {
                    e.preventDefault();

                    var target = $(e.target),
                        typeSource = this.getMod(target, 'type');

                    if (_this._typeSource && _this._typeSource !== typeSource) {
                        _this
                            .delMod(_this.elem('source-switcher'), 'active')
                            .delMod(_this.elem('source-item'), 'visible');
                    }

                    _this._typeSource = typeSource;

                    _this.toggleSource(typeSource);

                    if (typeSource === 'html') {
                        _this._getHtml(_this.elemParams(target).urlBemhtml);
                    }

                    if (typeSource === 'bemjson') {
                        _this.loadIframe('source-code', 'bemjson');
                    }
                });

                Dropdown.on(this.elem('qr'), { modName: 'js', modVal: 'inited' }, function (e) {
                    var dropdown = e.target,
                        src = this.elemParams(this.elem('qr')).url,
                        image = dropdown.findBlockInside('image');

                    image.domElem.attr('src', src);
                }, this);

                this.loadComplete = {};
            },
            '': function () {
                Dropdown.un(this.elem('qr'), { modName: 'js', modVal: 'inited' });
            }
        }
    },

    changeHeight: function (el) {
        var iframe = this.elem(el),
            doc = iframe[0].contentDocument || iframe[0].contentWindow && iframe[0].contentWindow.document,
            height;

        if (!doc) return;

        height = doc.documentElement.scrollHeight || doc.body.scrollHeight;

        if (el === 'source-code') {
            // fix visible scroll
            height += 5;
        }

        if (this._actualHeight !== height) {
            iframe.attr('height', height);
            this._actualHeight = height;
        }
    },

    toggleSource: function (type) {
        var sourceItem = this.elem('source-item', 'type', type);

        this
            .toggleMod(this.elem('source-switcher', 'type', type), 'active', 'yes', '')
            .toggleMod(sourceItem, 'visible', true, '');

            if (!window.legacyIE && type === 'bemjson' || type === 'deps') {
                hljs.highlightBlock(sourceItem.get(0));
            }
    },

    _getHtml: function (url) {
        $.ajax({ url: url, dataType: 'text', context: this })
            .done(function (html) {

                html = beautify.html(html, { unformatted: [
                    'a', 'img', 'bdo', 'em', 'strong', 'dfn', 'code', 'samp',
                    'kbd', 'var', 'cite', 'abbr', 'acronym', 'q', 'sub', 'sup',
                    'tt', 'i', 'b', 'big', 'small', 'u', 's', 'strike', 'font',
                    'ins', 'del', 'pre', 'address', 'dt'
                ] });

                var htmlSource = this.elem('source-code', 'type', 'html').text(html + ' ');

                !window.legacyIE && hljs.highlightBlock(htmlSource.get(0));
            })
            .fail(function (error) { console.log('error', error); });
    },

    loadIframe: function (el, type) {
        if (this.loadComplete[el]) return;

        var _this = this,
            $el = _this.elem(el),
            iframe = type === 'bemjson' ? _this.elem('source-item', 'type', 'bemjson').find($el) : $el,
            url = iframe.data('url'),
            isLive = (el === 'live');

        isLive && this._toggleSpin();

        iframe.attr('src', url);

        iframe.load(function () {
            isLive && _this._toggleSpin();

            _this.changeHeight(el);

            _this.loadComplete[el] = true;

            _this.emit('iframeLoaded');
        });
    },

    _toggleSpin: function () {
        this.findBlockInside('live-spin', 'spin').toggleMod('progress', true, '');
    }

}));

});
