modules.define('appError', ['httpError'], function(provide, httpError) {
    provide({
        HttpError: httpError
    });
});
