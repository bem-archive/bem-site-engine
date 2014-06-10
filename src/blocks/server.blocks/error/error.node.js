modules.define('error', ['httpError'], function(provide, httpError) {
    provide({
        HttpError: httpError
    })
});
