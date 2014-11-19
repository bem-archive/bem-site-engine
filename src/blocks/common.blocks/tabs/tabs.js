modules.define('i-bem__dom', ['jquery'], function(provide, $, BEMDOM) {

BEMDOM.decl('tabs', {
	onSetMod: {
		js: {
			inited: function() {
                this._disabled = false;
                /* показываем текущий pane для активного таба */
                var currentIndex = this.getCurrentIndex();
                if(currentIndex > -1 && !this.getCurrentPane().length) {
                    this.setMod(this.getPane(currentIndex), 'state', 'current');
                }
			}
		}
	},

    /**
    * Показывает нужный таб
    * @param {jQuery|Number} элемент таба или его индекс
    * @param {event} [ev] событие, по которому произошел вызов
    * @returns {BEM}
    * @fires tabs#beforeSelect, tabs#select
    */
    setActiveTab: function(ctx, ev) {
        var tab = {},
            pane = {},
            currentTab,
            index;

        if (typeof ctx === 'object') { //domElem
            // проверяем наличие элемента в списке табов
            index = this.getTabIndex(ctx);
            if (index === -1) return this;

            tab = ctx;
            pane = this.getPane(index);

        } else if (!isNaN(ctx)) { // index
            tab = this.getTab(ctx);
            pane = this.getPane(ctx);
        }

        if (!tab.length) return this;

        currentTab = this.getCurrentTab();

        this.emit('beforeSelect', {
            oldTab: currentTab,
            newTab: tab
        });

        // отменяем событие для отключенных табов
        if (this.isDisabled() && ev) {
            ev.preventDefault();
            ev.stopPropagation();
            return this;
        }

        this
            .delMod(currentTab, 'state')
            .delMod(this.getCurrentPane(), 'state')
            .setMod(tab, 'state', 'current')
            .setMod(pane, 'state', 'current')
            .emit('select', {
                oldTab: currentTab,
                newTab: tab
            });
        return this;
    },

    /**
     * Возвращает индекс текущего таба
     * @returns {Number} Число или -1 если нету выбранных табов
     */
    getCurrentIndex: function() {
        return this.getTabIndex(this.getTab('state', 'current'));
    },

    /**
     * Возвращает индекс нужного таба
     * @param {jQuery} элемент таба
     * @returns {Number} Число или -1 если нету выбранных табов
     */
    getTabIndex: function(elem) {
        return this.getTabs().index(elem);
    },

    /**
     * Возвращает индекс нужной панели
     * @param {jQuery} элемент панели
     * @returns {Number} Число или -1 если нету выбранной панели
     */
    getPaneIndex: function(elem) {
        return this.getPanes().index(elem);
    },

    /**
     * Включает переключение табов
     * @returns {BEM}
     */
    enable: function() {
        this._disabled = false;
        return this;
    },

    /**
     * Выключает переключение табов
     * @returns {BEM}
     */
    disable: function() {
        this._disabled = true;
        return this;
    },

    /**
     * Возращает включено или выключено переключение табов
     * @returns {boolean}
     */
    isDisabled: function () {
        return this._disabled;
    },

    /**
     * Получение списка табов
     * @returns {jQuery[]}
     */
    getTabs: function () {
        return this.elem('tab');
    },

    /**
     * Получение списка панелей
     * @returns {jQuery[]}
     */
    getPanes: function() {
        return this.elem('pane');
    },

    /**
     * Получение текущего таба
     * @returns {jQuery}
     */
    getCurrentTab: function() {
        return this.getTab('state', 'current');
    },

    /**
     * Получение текущей панели
     * @returns {jQuery}
     */
    getCurrentPane: function() {
        return this.getPane('state', 'current');
    },

    /**
     * Получение таба
     * @param {String|index} имя модификатора или индекс таба
     * @param {String} [modVal] значение модификатора(если указано имя)
     * @returns {jQuery}
     */
    getTab: function (ctx, modVal) {
        return arguments.length === 2 ?
            this.elem('tab', ctx, modVal) :
            !isNaN(ctx) && this.getTabs().eq(ctx);
    },

    /**
     * Получение панели
     * @param {String|index} имя модификатора или индекс панели
     * @param {String} [modVal] значение модификатора(если указано имя)
     * @returns {jQuery}
     */
    getPane: function (ctx, modVal) {
        return arguments.length === 2 ?
            this.elem('pane', ctx, modVal) :
            !isNaN(ctx) && this.getPanes().eq(ctx);
    }

}, {
    live: function() {
        this.liveBindTo('tab', 'pointerclick', function(e) {
            window.location.hash = '';
            this.setActiveTab(e.currentTarget, e);
        });
    }
});

provide(BEMDOM);

});
