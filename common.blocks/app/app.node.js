modules.define(
    'app',
    ['yana-http', 'yana-handler_type_common', 'yana-cluster', 'yana-logger', 'yana-config'],
    function(provide, Http, RequestHandler, Cluster, logger, config) {

provide(function() {
    var cluster = new Cluster(),
        app = new Http({ handlers : [ RequestHandler ] });

    cluster.run(app.run.bind(app));
});

});
