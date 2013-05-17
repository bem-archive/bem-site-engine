/* jshint node:true */
/* global modules:false */

(function() {

var QS = require('querystring'),
    UTIL = require('util');

modules.define(
    'ya-auth',
    ['objects', 'yana-config', 'yana-logger', 'http-provider'],
    function(provide, objects, config, logger, httpProvider) {

var bb = config.hosts.blackbox,
    defaultParams = {
        'bb-host' : bb.host,
        'host'    : bb.domain,
        'format'  : 'json',
        'allowGzip' : true,
        'timeout' : 300
    };

/*

modules.require('ya-auth', function(yaAuth) {

    yaAuth.auth(req);

    yaAuth.userinfo(req);

});

*/

provide({

    /**
     * @param {Object} params
     * @param {String} params['bb-host']
     * @param {String} params['method']
     * @param {String} params['format']
     * @returns {String}
     */
    _buildUrl : function(params) {
        return UTIL.format('%s/blackbox?%s&format=%s',
                params['bb-host'], this._buildMethodPath(params), params.format);
    },

    /**
     * @param {Object} params
     * @param {String} params.method
     * @returns {String}
     */
    _buildMethodPath : function(params) {
        var method = params.method;
        if(!method)
            throw new Error('method is not specified');

        var paramMap = {
                'sessionid' : ['sessionid', 'userip', 'host'],
                'userinfo'  : ['userip', ['uid', 'login', 'suid']],
                'checkip'   : ['ip', 'nets']
            },
            methods = Object.keys(paramMap);

        if(!~methods.indexOf(method))
            throw new Error('unknown method');

        var mparams = paramMap[method],
            qs = {},
            i = 0,
            p;

        // TODO: refactoring
        while(p = mparams[i++]) {
            if(typeof p === 'string') {
                // if param is string it is required
                if(params.hasOwnProperty(p)) {
                    qs[p] = params[p];
                } else {
                    throw new Error('param "' + p + '" is requered for method "' + method + '"');
                }
            } else {
                // else it is an Array of one of
                var ii = 0,
                    pp;

                while(pp = p[ii++]) {
                    if(params.hasOwnProperty(pp)) {
                        qs[pp] = params[pp];
                        break;
                    }
                }

                if(ii >= p.length)
                    throw new Error('one of params "' + p.join(', ') + '" is requered for method "' + method + '"');
            }
        }

        // TODO:
        objects.extend(qs, params);

        return QS.stringify(qs);
    },

    _getProviderParams : function(params) {
        return objects.extend(params, {
                url : this._buildUrl(params),
                method : 'GET'  // XXX: ugly!
            });
    },

    _runMethod : function(params) {
        var opts = this._getProviderParams(objects.extend(defaultParams, params));
        return httpProvider.create(opts).run();
    },

    /**
     * @param {http.ServerRequest} req
     * @param {Object} [params]
     * @returns {Promise * Object}
     */
    auth : function(req, params) {
        var opts = objects.extend({
                method : 'sessionid',
                sessionid : req.cookies['Session_id'] || '',
                userip : req.userip,
                regname : 'yes'
            }, params);

        return this._runMethod(opts);
    },

    /**
     * @param {http.ServerRequest} req
     * @param {Object} [params]
     * @returns {Promise * Object}
     */
    userinfo : function(req, params) {
        var opts = objects.extend({
                method : 'userinfo',
                userip : req.userip,
                regname : 'yes'
            }, params);

        return this._runMethod(opts);
    }

});

});

}());
