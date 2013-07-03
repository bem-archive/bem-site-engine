/* jshint node:true */
/* global modules:false */

modules.define(
    'ya-auth',
    ['objects', 'yana-config', 'yana-logger', 'http-provider'],
    function(provide, objects, config, logger, httpProvider) {

var QS = require('querystring'),
    UTIL = require('util'),

    BB = config.hosts.blackbox,
    DEFAULT_PARAMS = {
        'bb-host' : BB.host,
        'host'    : BB.domain,
        'format'  : 'json'
    },
    DEFAULT_OPTS = {
        method : 'GET',
        allowGzip : true,
        timeout : 300
    };

/**

modules.require('ya-auth', function(yaAuth) {

    yaAuth.auth(req);

    yaAuth.userinfo(req);

});

*/

provide({

    /**
     * @param {Object} params
     * @property {String} params['method']
     * @property {String} [params['bb-host']]
     * @property {String} [params['format']]
     * @returns {String}
     */
    _formatUrl : function(params) {
        params = objects.extend({}, DEFAULT_PARAMS, params);
        return UTIL.format('%s/blackbox?%s', params['bb-host'], this._formatPath(params));
    },

    /**
     * @param {Object} params
     * @property {String} params.method
     * @property {String} params.format
     * @returns {String}
     */
    _formatPath : function(params) {
        var method = params.method;
        if(!method)
            throw new Error('method is not specified');

        /**
         * A map for method's params validation
         */
        var paramMap = {
                'sessionid' : ['sessionid', 'userip', 'host'],
                'userinfo'  : ['userip', ['uid', 'login', 'suid']],
                'checkip'   : ['ip', 'nets']
            },
            methods = Object.keys(paramMap);

        if(methods.indexOf(method) === -1)
            throw new Error('unknown method');

        var mparams = paramMap[method],
            qs = {},
            i = 0,
            p;

        function serialize(p) {
            if(!params.hasOwnProperty(p)) {
                return false;
            }
            qs[p] = params[p];
        }

        while(p = mparams[i++]) {
            if(typeof p === 'string') {
                if(serialize(p) === false)
                    throw new Error('param "' + p + '" is required for method "' + method + '"');
            } else {
                // else it is an Array of "one of"
                var ii = 0, pp;

                while(pp = p[ii++]) {
                    if(serialize(pp) !== false) break;
                }

                if(ii >= p.length)
                    throw new Error('one of params "' + p.join(', ') + '" is required for method "' + method + '"');
            }
        }

        // TODO: filtering out some of unnecessary params
        delete params['bb-host'];

        objects.extend(qs, params);

        return QS.stringify(qs);
    },

    _runMethod : function(method, params) {
        var opts = objects.extend({}, DEFAULT_OPTS, params);

        params.method = method;
        opts.url = this._formatUrl(params);

        logger.debug('yaAuth: Running "%s" \\w params: %j', params.method, opts);

        return httpProvider.create(opts).run()
            .then(function(res) {
                return res.data;
            });
    },

    /**
     * @param {http.ServerRequest} req
     * @param {Object} [params]
     * @returns {Promise * Object}
     */
    auth : function(req, params) {
        var opts = objects.extend({
                sessionid : req.cookies['Session_id'] || '',
                userip : req.userip,
                regname : 'yes'
            }, params);

        return this._runMethod('sessionid', opts);
    },

    /**
     * @param {http.ServerRequest} req
     * @param {Object} [params]
     * @returns {Promise * Object}
     */
    userinfo : function(req, params) {
        var opts = objects.extend({
                userip : req.userip,
                regname : 'yes'
            }, params);

        return this._runMethod('userinfo', opts);
    }

});

});
