modules.define('i-bem__dom', ['jquery'], function(provide, $, BEMDOM) {

BEMDOM.decl({ block: 'menu-list', modName: 'type', modVal: 'default' }, {
    onSetMod: {
        js: {
            inited: function() {
                var _this = this;

                _this.__base();

                _this.setSelectUrl();

                _this.setLinksUrl();

                this.bindTo('select', 'change', function(e) {
                    var $this = $(e.currentTarget),
                        url = $this.val(),

                        // TODO: придумать другой способ получать текст ссылки
                        libname = $this.prev('.menu-list__link').text();

                    _this.showLibPage(url);
                    _this.setStorage(libname, url);
                });
            }
        }
    },

    setSelectUrl: function() {
        var _this = this;

        _this.elem('select').each(function() {
            var libname = $(this).prev('.menu-list__link').text(),
                lib = _this.getStorage(libname),
                path = location.pathname.match(/\/libs\S+?\/[\w.-]+/);

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
        var loc = window.location;

        loc.origin = loc.origin || loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port: '');

        loc.href = loc.origin + url;
    }
});

provide(BEMDOM);

});
