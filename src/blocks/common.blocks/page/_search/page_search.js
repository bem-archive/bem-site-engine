modules.define('page', ['jquery', 'keyboard__codes'], function (provide, $, keyboard, Page) {
    provide(Page.decl({ modName: 'search', modVal: true }, {
        onSetMod: {
            js: {
                inited: function () {
                    this.__base.apply(this, arguments);

                    var _this = this;
                    this._searchButton = this.findBlockInside('search-button');
                    this._searchPanel = this.findBlockInside('search-panel');
                    this._searchForm = this.findBlockInside('search-form');
                    this._contentWrapper = this.findBlockInside('content-wrapper');

                    this.bindToDoc('click keyup', function (e) {
                        var target = $(e.target);

                        _this._toggleSearch(e, target);
                    });
                }
            }
        },

        _toggleSearch: function (e, target) {
            var sBtn = this._searchButton,
                sPanel = this._searchPanel,
                sForm = this._searchForm,
                cWrapper = this._contentWrapper;

            if (sForm.containsDomElem(target)) return false;

            if (e.type === 'keyup' && e.which === keyboard.ESC) {
                sPanel.delMod('state');
                return false;
            }

            if (sPanel.containsDomElem(target) || sBtn.containsDomElem(target)) {
                sPanel.toggleMod('state', 'open');
                sBtn.toggleMod('active', true);
            } else if (cWrapper.containsDomElem(target)) {
                sPanel.delMod('state');
                sBtn.delMod('active');
            }
        }
    }));
});
