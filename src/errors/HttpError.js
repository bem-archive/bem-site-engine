var Terror = require('terror');

module.exports = Terror.create('HttpError', {
    NOT_FOUND: [404, 'Resource not found'],
    INTERNAL_SERVER_ERROR: [500, 'Error occured on server']
});
