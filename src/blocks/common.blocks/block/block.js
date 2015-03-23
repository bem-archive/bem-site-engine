modules.define('block', ['i-bem__dom', 'jquery', 'history'], function (provide, BEMDOM, $, History) {
    'use strict';

    provide(BEMDOM.decl(this.name, {
        onSetMod: {
            js: {
                inited: function () {
                    this._wrapTables();
                    this._tabs = this.findBlockInside('tabs');

                    if (this._tabs) {
                        this._tabs.bindTo('tab', 'pointerclick', { ctx: this }, this._onTabClick);
                        this._history = new History();
                        this._history.on('statechange', this._onPopState, this);
                        this._openTabFirst();
                    }
                }
            }
        },

        /**
         * Handler on click tabs block elem `tab`
         * Set new url to browser address bar with name of the tab
         * If tab name is examples, load examples iframes
         * @param {Object} e - event jQuery
         * @private
         */
        _onTabClick: function (e) {
            var _this = e.data.ctx,
                $tab = $(e.currentTarget),
                tabName = $tab.attr('href');

            _this._setUrl(tabName);
            _this._loadExamples($tab);
        },

        /**
         * Handler on click back/next button in browser
         * open the tab by changed url in address bar
         * For browsers, that not support history API,
         * bem-history generate `popstate` event on every hashchange for support back/next buttons,
         * but in our cases this brings us some problem:
         * when we click on tab and open needed one pane,
         * we get `popstate` event, like we click on back/next button
         * and call `this._openTab` twice
         * @private
         */
        _onPopState: function () {
            if (!this._supportHistoryApi()) return;

            var state = this._history.state,
                tabName = state && (state.tab || state.data && state.data.tab);

            this._openTab(tabName);
        },

        /**
         * Open tab pane first, when page was loaded
         * If location.pathname contain tabName, this tab will be activate
         * @returns {*}
         * @private
         */
        _openTabFirst: function () {
            this._openTab(this._getTabNameByPath());
        },

        /**
         * Open tab by passed name
         * If tab name is undefined, open first tab
         * If tab name is examples, load examples
         * @param tabName
         * @private
         */
        _openTab: function (tabName) {
            var $tab = tabName ? this._getTabByName(tabName) : this._tabs.getTab(0);

            this._tabs.setActiveTab($tab);
            this._loadExamples($tab);
        },

        /**
         * Get jQuery tab elem by passed name
         * @param {String} tabName - name of the tab, that we want to get
         * @returns {jQuery|null} - if we not found the tab, return null
         * @private
         */
        _getTabByName: function (tabName) {
            var tabs = this._tabs.getTabs().filter(function (idx, item) {
                return $(item).attr('href') === tabName;
            });

            return tabs.length ? tabs.eq(0) : null;
        },

        /**
         * Get current current tab`s name from location.href
         * Example 1: https://ru.bem.info/libs/bem-core/button/jsdoc/ -> jsdoc
         * Example 2(old browser): https://ru.bem.info/libs/bem-core/button/#!/jsdoc/ -> jsdoc
         * Example 3: https://ru.bem.info/libs/bem-core/button/ -> null
         * @returns {String|null} - tab name
         * @private
         */
        _getTabNameByPath: function () {
            var name = window.location.href.match(/\/(docs|jsdoc|examples)/),
                tabName = name ? name[1] : null;

            if (!this._supportHistoryApi() && tabName) {
                window.location.href = window.location.href.replace(tabName, '#!/' + tabName);
            }

            return tabName;
        },

        /**
         * Special method to get original path without tab name
         * This is needed to fix duplicating the name of the tab in the browser`s address bar,
         * e.g 'button/docs/jsdoc/examples/docs/'.
         * When the name of the tab has set already, get path without name of the tab
         * For example: /libs/name-of-libs/master/button/docs/ -> get  /libs/name-of-libs/master/button/
         * For old browsers use only the name of the tab for set link, cause use with hashbang '#!/ + tabname'
         * @returns {String}
         * @private
         */
        _getUrl: function (tabName) {
            var location = window.location,
                url,
                path;

            if (this._supportHistoryApi()) {
                path = this._isTabNameInPath() ? location.pathname.match(/\S+(?=(docs)|(jsdoc)|(examples))/)[0] : '';
                url = path + tabName + '/';
            }

            return url ? url : tabName;
        },

        /**
         * Set new url to browser`s address bar
         * Base on bem-history library
         * For old browser use the fallback to hashbang '#!/ + tabname'
         * @param {String} tabName - the name of the current active tab
         * @private
         */
        _setUrl: function (tabName) {
            this._history.changeState('push', { tab: tabName, title: '', url: this._getUrl(tabName) });
        },

        /**
         *  Lazy loading for default examples in tab 'examples'
         *  We found all example inside block and check if this example not inline
         *  and in this time example not active - do not load this example
         * @param $tab
         * @private
         */
        _loadExamples: function ($tab) {
            if (this._isJSDocTab($tab)) return;

            var ctx = {
                block: 'block-example',
                modName: 'view',
                modVal: this._isExamplesTab($tab) ? 'default' : 'inline'
            };

            this.findBlocksInside(ctx).forEach(function (example) {
                example.setMod('js', 'inited').loadIframe('live');
            });
        },

        /**
         * Method for detected support native html5 history API
         * @returns {*|History|boolean}
         * @private
         */
        _supportHistoryApi: function () {
            var history = window.history;

            return history && 'pushState' in history;
        },

        /**
         * Check if the name of the tab exist in url path
         * @returns {boolean}
         * @private
         */
        _isTabNameInPath: function () {
            return (/\/(docs|jsdoc|examples)\/$/).test(window.location.pathname);
        },

        /**
         * Check if passed tab is jsdoc
         * @param {jQuery} $tab
         * @returns {boolean}
         * @private
         */
        _isJSDocTab: function ($tab) {
           return $tab.attr('href') === 'jsdoc';
        },

        /**
         * Check if passed tab is examples
         * @param {jQuery} $tab
         * @returns {boolean}
         * @private
         */
        _isExamplesTab: function ($tab) {
            return $tab.attr('href') === 'examples';
        },

        /**
         * Wrap html tables that wide tables didn't create horizontal page scroll
         * @private
         */
        _wrapTables: function () {
            var tables = this.domElem.find('table');

            tables && tables.each(function () {
                $(this).wrap('<div class="table-container"></div>');
            });
        }

    }));
});
