modules.define(
    'yana-response',
    ['inherit', 'yana-logger'],
    function(provide, inherit, logger, Response) {

provide(inherit(Response, {

    __constructor : function(res) {
        var start = Date.now();

        res = this.__base.apply(this, arguments);

        Object.defineProperty(res, 'birth', {
            get : function() {
                return start;
            }
        });

        res.on('finish', function() {
            logger.debug('Response time: %dms', Date.now() - this.birth);
        });

        return res;
    }

}));

});
