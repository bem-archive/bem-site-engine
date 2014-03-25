modules.define('i-bem__dom', ['jquery'], function(provide, $, BEMDOM) {

BEMDOM.decl({ block: 'menu-list', modName: 'type', modVal: 'default' }, {
    onSetMod: {
        js: {
            inited: function() {
                var _this = this;

                _this.setSelectUrl();

                _this.setLinksUrl();

                this.bindTo('select', 'change', function(e) {
                    var $this = $(e.currentTarget),
                        url = $this.val(),

                        // TODO: придумать другой способ получать текст ссылки
                        lib = $this.prev('.menu-list__link').text();

                    _this.showLibPage(url);
                    _this.setStorage(lib, url);
                });
            }
        }
    },

    setSelectUrl: function() {
        var _this = this;

        _this.elem('select').each(function() {
            var libname = $(this).prev('.menu-list__link').text(),
                lib = _this.getStorage(libname),
                path = location.pathname.match(/\/l\w*\/[\w-]*\/[\w.]*/);

            if(lib) {
                if(path && path[0].indexOf(libname) !== -1 ) {
                    $(this).val(path);

                    _this.setStorage(libname, path);
                } else {
                    $(this).val(lib);
                }
            }
        });
    },

    setLinksUrl: function() {
        var _this = this,
            links = _this.elem('link', 'type', 'select');

        _this.elem('select').each(function(idx, el) {
            var link = links.eq(idx);

            link.attr('href', $(el).val());
        });
    },

    showLibPage: function(url) {
        location.href = location.origin + url;
    },

    getStorage: function(lib) {
        return localStorage.getItem(lib);
    },

    setStorage: function(lib, url) {
        return localStorage.setItem(lib, url);
    }
});

provide(BEMDOM);

});
