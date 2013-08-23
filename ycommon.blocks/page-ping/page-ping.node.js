modules.define(
    'yana-view',
    ['yana-router', 'yana-logger'],
    function(provide, router, logger, View) {

router.addRoute({
    rule : '/monitoring',
    data : {
        action : 'ping'
    }
});

View.decl('ping', {

    render : function() {
        logger.debug('Rendering "ping" view');
        this.res.writeHead(200, { 'Content-Type' : 'text/plain' });
        return 'Pong!';
    }

});

provide(View);

});
