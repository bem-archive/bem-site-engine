modules.define(
    'app',
    ['yana:http', 'yana:handler_type_common', 'yana:cluster', 'yana:config'],
    function(provide, Http, RequestHandler, Cluster, config) {

provide(function() {
    var cluster = new Cluster(),
        app = new Http({ handlers : [ RequestHandler ] }),
        worker = app.run.bind(app);

    cluster.run(worker);
});

});
