modules.define(
    'yana-view',
    ['yana-template'],
    function(provide,template, View) {

var PATH = require('path');

provide(View.decl('yana-view', {

    _loadTemplate : function() {
        return template.load(PATH.basename(__dirname));
    }

}))

});