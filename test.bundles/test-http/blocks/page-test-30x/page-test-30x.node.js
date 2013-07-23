modules.define(
    'yana-view',
    ['yana-router', 'http-provider'],
    function(provide, router, httpProvider, View) {

router.addRoute({
    name : 'page-redirect',
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


View.decl('test-30x', {

    _loadTemplate : function() {
        return;
    },

    _shoot : function(url) {
        var opts = {
            url : url,
            method : 'post',
            data : {
                body : 'Here comes a text'
            }
        };

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

    _handle : function() {
        var req = this.req;

        // testing redirect looping
        if(req.route.data.name === 'page-redirect-lulz') {
            this.res.redirect(this.path + '?from=' + encodeURIComponent(this.path));
            return;
        }

        // testing single redirect
        if(!req.query.from) {
            this.res.redirect(this.path + '?from=' + encodeURIComponent(this.path));
            return;
        }

        var keys = ['headers', 'method', 'path', 'query', 'body', 'cookies'];

        return keys.map(function(param) {
                var val = req[param];
                return [param, typeof val === 'string'? val : JSON.stringify(val)].join(' : ');
            })
            .join('; ');
    },

    render : function() {
        this.res.setHeader('content-type', 'text/plain');

        var req = this.req,
            target = 'http://localhost:3014' + this.path;

        if(req.query.from) {
            return this._handle();
        }

        switch(req.method.toUpperCase()) {

        case 'GET': {
            return this._shoot(target);
        }

        case 'POST': {
            return this._handle();
        }

        }

        return 'Ouch!';
    }

});

provide(View);

});
