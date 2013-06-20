modules.define(
    'app',
    ['yana-http', 'yana-handler', 'yana-config'],
    function(provide, Http, RequestHandler, config) {

function run() {
    var app = new Http({ handlers : [ RequestHandler ] });
    app.run();
};

provide(run);

});
