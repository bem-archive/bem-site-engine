modules.define('i-bem__dom', ['jquery'], function(provide, $, BEMDOM) {

BEMDOM.decl('block', {

    onSetMod: {
        js: {
            inited: function() {
                var _this = this,
                    tabs = _this.findBlockInside('tabs');

                _this.wrapTables();

                if(tabs) {

                    _this._openTabFromUrl(tabs);

                    // support back/next button in browser (html5 history api)
                    _this.bindToWin('popstate', function() {
                        _this._openTabFromUrl(tabs);
                    });

                    // set url for the current tab (html5 history api)
                    tabs.on('select', function(e, data) {
                        var tabName = data.newTab.data('tab');

                        _this._setTabUrl(tabName);

                        if(tabName === 'examples') {
                            _this._loadExamples();
                        }
                    });
                }
            }
        }
    },

    wrapTables: function() {
        var tables = this.domElem.find('table');

        if(tables.length) {
            tables.each(function() {
                $(this).wrap('<div class="table-container"></div>');
            });
        }
    },

    // When page load, first time open tabs
    // if the name of a tab in the location.pathname
    _openTabFromUrl: function(tabs) {
        if(this._isTabNameInPath()) {
            this._openTabByDataName(tabs, this._getTabName());
        } else {
            tabs.setActiveTab(0);
        }
    },

    _isTabNameInPath: function() {
        return this._getTabName() ? true : false;
    },

    _openTabByDataName: function(tabs, tabName) {
        var _this = this;

        tabs.elem('tab').each(function(idx, tab) {
            if($(tab).data('tab') === tabName) {
                tabs.setActiveTab($(tab));
            }

            if(tabs.hasMod(tabs.getCurrentTab(), 'examples', 'yes')) {
                _this._loadExamples();
            }
        });
    },

    _getTabName: function() {
        // get tabName without slashes
        var tabName = window.location.pathname.match(/\/(docs|jsdoc|examples)\/$/);

        return tabName ? tabName[1] : false;
    },


    _setTabUrl: function(tabName) {
        // inherit form page block
        if(window.legacyIE) return;

        // Fix duplicate name tab in location.pathname, 'button/docs/jsdoc/examples/docs/'
        // when tabname is isset in location.pathname,
        // in this case get direct block path with regexp + tab name
        if(this._isTabNameInPath()) {
            tabName = window.location.pathname.match(/\S+(?=(docs)|(jsdoc)|(examples))/)[0] + tabName;
        }

        window.history.pushState(null, null, tabName + '/');
    },

    _loadExamples: function() {
        this.findBlocksInside('block-example').forEach(function(example) {
            example
                .setMod('js', 'inited')
                .loadIframe('live');
        });
    }

});

provide(BEMDOM);

});
