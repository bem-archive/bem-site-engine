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
            var isLibsPath = location.pathname.match(/\/libs\//);

            if(isLibsPath) {

                var _this = this,
                    locPath = location.pathname,
                    libLocPath = locPath.match(/\/libs\S+?\/[\w.-]+/);

                _this.elem('select').each(function() {
                    var libname = $(this).prev('.menu-list__link').text(),
                        storage = _this.getStorage(libname),
                        defaultVal = $(this).val();

                    // HACK, reset dev-docs branch, to delete a month
                    if(storage && storage.indexOf('dev-docs') !== -1) {
                        localStorage.removeItem(libname);
                        storage = false;
                    } else if(storage) {

                        if(libLocPath && libLocPath[0].indexOf(libname + '/') !== -1) {

                            // check if href contains key word 'current'
                            if(locPath.match(/\/current\//)) {
                                libLocPath[0] = defaultVal;
                            } else {
                                $(this).val(libLocPath[0]);
                            }

                            _this.setStorage(libname, libLocPath[0]);

                        } else {
                            $(this).val(storage);
                        }

                    } else {
                        _this.setStorage(libname, defaultVal);
                    }

                });
            }
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
