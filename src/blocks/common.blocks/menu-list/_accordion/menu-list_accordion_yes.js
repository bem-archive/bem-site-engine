modules.define('i-bem__dom', ['jquery'], function(provide, $, BEMDOM) {

BEMDOM.decl({ block: 'menu-list', modName: 'accordion', modVal: 'yes' }, {
    onSetMod: {
        'js' : {
            'inited': function() {
                //TODO: сделать 'accordion module' после https://github.yandex-team.ru/lego/bem-info/issues/238
            }
        }
    }

}, {});

provide(BEMDOM);

});
