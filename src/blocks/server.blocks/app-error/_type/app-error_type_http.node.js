var Terror = require('terror');

modules.define('httpError', function (provide) {
    provide(Terror.create('HttpError', {
        NOT_FOUND: [404, 'Resource not found'],
        INTERNAL_SERVER_ERROR: [500, 'Error occured on server']
    }));
});
