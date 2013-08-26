modules.define(
    'yana-view',
    ['yana-router', 'http-request'],
    function(provide, router, httpRequest, View) {

router.addRoute({
    name : 'page-get-send',
    rule : '/get/send',
    data : { action : 'test-methods', 'use-method' : 'get' }
});

router.addRoute({
    name : 'page-post-send',
    rule : '/post/send',
    data : { action : 'test-methods', 'use-method' : 'post' }
});

router.addRoute({
    name : 'page-delete-send',
    rule : '/delete/send',
    data : { action : 'test-methods', 'use-method' : 'delete' }
});

router.addRoute({
    name : 'page-method-handle',
    rule : '/handle',
    method : ['get', 'post', 'delete'],
    data : { action : 'test-methods' }
});

View.decl('test-methods', {

    _loadTemplate : function() {
        return;
    },

    _shoot : function(url, method) {
        var opts = {
            url : url,
            method : method,
            data : {
                body : 'Here comes a text'
            }
        };

        return httpRequest.create(opts)
            .run()
            .always(function() {
                var ret = [].slice.call(arguments, 0);
                return [
                    'request:',
                    JSON.stringify(opts, null, 2),
                    'response:',
                    JSON.stringify(ret, null, 2)
                ].join('\n');
            });
    },

    _handle : function() {
        var req = this.req,
            keys = ['headers', 'method', 'path', 'query', 'body', 'cookies'];

        return keys.map(function(param) {
                var val = req[param];
                return [param, typeof val === 'string'? val : JSON.stringify(val)].join(' : ');
            })
            .join('; ');
    },

    render : function() {
        this.res.setHeader('content-type', 'text/plain');
        var route = this.req.route,
            data = route.data,
            target = 'http://localhost:3014/handle';

        switch(data.name) {

        case 'page-get-send':
        case 'page-post-send':
        case 'page-delete-send': {
            var method = data['use-method'];
            return this._shoot(target, method);
        }

        case 'page-method-handle': {
            return this._handle();
        }

        }

        return 'Ouch!';
    }

});

provide(View);

});
