modules.define('page', ['jquery', 'keyboard__codes'], function (provide, $, keyboard, Page) {
    provide(Page.decl({ modName: 'search', modVal: true }, {
        onSetMod: {
            js: {
                inited: function () {
                    this.__base.apply(this, arguments);

                    var _this = this;
                    this._searchButton = this.findBlockInside('search-button');
                    this._searchPanel = this.findBlockInside('search-panel');
                    this._contentWrapper = this.findBlockInside('content-wrapper');

                    this.bindToDoc('click keyup', function (e) {
                        var target = $(e.target);

                        _this._toggleSearch(e, target);
                    });
                }
            }
        },

        _toggleSearch: function (e, target) {
            if (e.type === 'keyup' && e.which === keyboard.ESC) {
                this._searchPanel.delMod('state');

                return false;
            }

            if (this._searchButton.containsDomElem(target) || this._searchPanel.containsDomElem(target)) {
                this._searchPanel.setMod('state', 'open');
                this._searchButton.setMod('active', true);
            } else if (this._contentWrapper.containsDomElem(target)) {
                this._searchPanel.delMod('state');
                this._searchButton.delMod('active');
            }
        }
    }));
});
