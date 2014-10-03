modules.define('lib-switch', ['i-bem__dom'], function(provide, BEMDOM) {

    'use strict';

    provide(BEMDOM.decl(this.name, {
        onSetMod: {
            js: {
                inited: function() {
                    this._select = this.findBlockInside('select');

                    this._setLinkVal();
                    this._select.on('change', this._onChange, this);
                }
            }
        },

        _setLinkVal: function() {
            this.findBlockInside('link').domElem.attr('href', this._select.getVal());

            return this;
        },

        _onChange: function() {
            this._openLibPage(this._select.getVal());
        },

        _openLibPage: function(url) {
            var loc = window.location;

            loc.href = (loc.origin || loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port: '')) + url;

            return this;
        }
    }))
});
