modules.define('i-bem__dom', function(provide, DOM) {

DOM.decl('p-libraries', {

    onSetMod : {

        js : {

            inited : function() {
                
                this._offsetTop = this.domElem.offset().top - this.__self.FIXED_MARGIN;

                this
                    .bindTo(this.elem('list-item', 'type', 'libraries'), 'click', function(e) {
                        this._onLibraryItemClick(e);
                    })
                    .bindTo(this.elem('list-item', 'type', 'blocks'), 'mouseenter', function(e) {
                        this._onBlocksItemMouseEnter(e);
                    })
                    .bindToWin('resize', function(e) {
                        this._onWindowResize(e);
                    })
                    ._bindToScroll()
                    ._onScroll()
                    ._selectLibraryMenuItem();        
            },

            '' : function() {
                this._unbindFromScroll();
            }
        }

    },

    onElemSetMod : {

        'list-item' : {
            
            'active' : {
                'yes' : function(elem) {                     
                    this.findBlockInside(elem, 'topic').setMod('active', 'yes');
                },

                '' : function(elem) {                     
                    this.findBlockInside(elem, 'topic').delMod('active');
                }
            }        
        }
    },
    
    /**
     * Обработчик события изменения окна браузера
     * Нужен для подстройки высоты списка библиотек под высоту окна браузера
     */
    _onWindowResize : function() {
        var menu = this.elem('list', 'position', 'left');
        this.hasMod(menu, 'fixed', 'yes') ? 
            menu.css('height', this.__self.win.height() - 2*this.__self.FIXED_MARGIN) : 
            menu.css('height', this.__self.win.height() - this.__self.HEADER_HEIGHT - this.__self.BREADCRUMBS_HEIGHT - 2*this.__self.FIXED_MARGIN); 

        return this;                 
    },  

    /**
     * Обработчик скроллинга на документе
     * Нужен для правильного позиционирования меню с библиотеками при вертикальном скроллинге страницы
     */
    _onScroll: function() {
        return  this.toggleMod(this.elem('list', 'position', 'left'), 'fixed', 'yes', '', 
                        this.__self.win[0].scrollY >= this._offsetTop)
                    ._onWindowResize();
    },

    /**
     * Обработчик клика на элементе в списке библиотек
     * @param  {Event} e - объект события
     */
    _onLibraryItemClick : function(e) {
        this
            ._clearItemsMod('active')
            .setMod(this.elem('list-item', 'item', this.getMod(e.domElem, 'item')), 'active', 'yes');
    },

    /**
     * Обработчик наведения мыши на элемент в списке групп блоков библиотеки
     * Нужен для реализации переключения активных элементов списка библиотек
     * @param  {Event} e - объект события
     */
    _onBlocksItemMouseEnter : function(e) {
        this
            ._clearItemsMod('active')
            .setMod(this.elem('list-item', 'item', this.getMod(e.domElem, 'item')), 'active', 'yes');
    },    

    /**
     * Метод для удаления модиикатора modName со всех элементов list-item
     * @param  {String} modName -  имя модификатора
     * @return {Object} - экземпляр блока p-libraries
     */
    _clearItemsMod : function(modName) {
        return this.delMod(this.elem('list-item'), modName);
    },

    /**
     * Метод для подписки блока на события скроллирования страницы
     * @return {Object} - экземпляр блока p-libraries
     */
    _bindToScroll : function() {
        this.__self.doc.on('scroll', this._onScroll.bind(this));
        return this;
    },

    /**
     * Метод для оnписки блока от события скроллирования страницы
     * @return {Object} - экземпляр блока p-libraries
     */
    _unbindFromScroll : function() {
        this.__self.doc.un('scroll', this._onScroll.bind(this));
        return this;
    },

    /**
     * Метод для выделения активного пункта меню после загрузки страницы
     */
    _selectLibraryMenuItem : function() {
        var hash = this.__self.win[0].location.hash;

        hash && this._clearItemsMod('active')
                    .setMod(this.elem('list-item', 'item', hash.substring(1)), 'active', 'yes');
    }

},{
    FIXED_MARGIN : 20,
    HEADER_HEIGHT : 70, /*Высота блока header*/
    BREADCRUMBS_HEIGHT : 50 /*Высота блока breadcrumbs*/
});

provide(DOM);

});
