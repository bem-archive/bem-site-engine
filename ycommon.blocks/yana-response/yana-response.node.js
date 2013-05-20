modules.define(
    'yana-response',
    ['inherit', 'yana-logger'],
    function(provide, inherit, logger, Response) {

provide(inherit(Response, {

    __constructor : function(res) {
        var start = Date.now();

        logger.debug('Going to response');

        res = this.__base.apply(this, arguments);

        res.on('finish', function() {
            logger.debug('Response time: %dms', Date.now() - start);
        });

        return res;
    }

}));

});
