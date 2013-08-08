modules.define(
    'yana-view',
    ['yana-router', 'http-provider', 'vow'],
    function(provide, router, httpProvider, Vow, View) {

router.addRoute({
    name : 'page-redirect-single',
    rule : '/redirect',
    method : ['get', 'post'],
    data : { action : 'test-30x' }
});

router.addRoute({
    name : 'page-redirect-lulz',
    rule : '/redirect/lulz',
    method : ['get', 'post'],
    data : { action : 'test-30x' }
});

router.addRoute({
    name : 'page-redirect-timeout',
    rule : '/redirect/timeout',
    method : ['get', 'post'],
    data : { action : 'test-30x' }
});


View.decl('test-30x', {

    _loadTemplate : function() {
        return;
    },

    _shoot : function(url, method) {
        var opts = {
            url : url,
            method : method,
            headers : {
                'X-My-Custom' : 'Yes!'
            },
            data : {
                body : 'Here comes a text'
            }
        };

        if(this.req.route.data.name === 'page-redirect-timeout') {
            opts.timeout = 500;
        }

        return httpProvider.create(opts)
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

    _response : function() {
        var req = this.req,
            keys = ['headers', 'method', 'path', 'query', 'body', 'cookies'];

        return keys.map(function(param) {
                var val = req[param];
                return [param, typeof val === 'string'? val : JSON.stringify(val)].join(' : ');
            })
            .join('; ');
    },

    _handle : function() {
        var req = this.req,
            name = req.route.data.name,
            count = (parseInt(req.query.from, 10) || 0) + 1,
            url = this.path + '?from=' + count;

        // testing single redirect
        if(name === 'page-redirect-single' && count < 2) {
            this.res.redirect(url);
            return;
        }

        // testing max redirect
        if(name === 'page-redirect-lulz') {
            this.res.redirect(url);
            return;
        }

        //testing redirects + timeout
        if(name === 'page-redirect-timeout') {
            if(count < 2) {
                this.res.redirect(url);
                return;
            }

            return Vow.delay(this._response(), 2000);
        }

        return this._response();
    },

    render : function() {
        this.res.setHeader('content-type', 'text/plain');

        var req = this.req,
            target = 'http://localhost:3015' + this.path;

        if(req.query.from) {
            return this._handle();
        }

        switch(req.method.toUpperCase()) {

        case 'GET':
            return this._shoot(target, 'post');

        case 'POST':
            return this._handle();

        }

        return 'Ouch!';
    }

});

provide(View);

});
