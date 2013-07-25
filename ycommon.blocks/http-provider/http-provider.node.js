/* jshint node:true */
/* global modules:false */

modules.define(
    'http-provider',
    ['inherit', 'next-tick', 'objects', 'vow', 'yana-logger', 'yana-error_type_http'],
    function(provide, inherit, nextTick, objects, Vow, logger, HttpError) {

var DNS = require('dns'),
    HTTP = require('http'),
    HTTPS = require('https'),
    URL = require('url'),
    QS = require('querystring'),
    ZLIB = require('zlib'),

    // DNS resolved cache
    cache = [];

// TODO: hardcoded
HTTP.globalAgent.maxSockets = 1024;

function getDataTypeFromHeaders(headers) {
    var contentType = headers['content-type'];
    if(contentType.indexOf('json') > -1) {
        return 'json';
    }

    return 'text';
}

function getDecoderFromHeaders(headers) {
    var encoding = headers['content-encoding'];
    switch(encoding) {

    case 'gzip':
        return ZLIB.Gunzip;

    case 'deflate':
        return ZLIB.Inflate;

    }
}

function processResponse(data, typ) {
    switch(typ) {

    case 'json':
        return JSON.parse(data);

    default:
        return data;

    }
}

provide(inherit({

    __constructor : function(params) {
        this.params = objects.extend({}, this.getDefaultParams(), params);

        this.params.method = this.params.method.toUpperCase();

        var headers = this.params.headers;
        this.params.headers = Object.keys(headers).reduce(function(hdrs, key) {
            hdrs[key.toLowerCase()] = headers[key];
            return hdrs;
        }, {});

        var _params = this.params,
            url = _params.url,
            parsedUrl = typeof url === 'string'?
                    URL.parse(url, true, true) : url;

        this._hasBody = _params.method === 'POST' || _params.method === 'PUT';
        this._dataType = _params.dataType;

        this._url = parsedUrl;
        this._redirCounter = 0;
    },

    run : function() {
        var params = this.params,
            hasBody = this._hasBody,
            body = hasBody? QS.stringify(params.data) : '';

        this._redirCounter = params.maxRedirects;

        return this._resolveHostname()
            .then(function(ip) {
                var url = this._url,
                    query = QS.stringify(
                        hasBody? url.query : objects.extend(url.query, params.data)),
                    hostname = url.hostname,
                    headers = params.headers || {};

                if(ip) {
                    headers['host'] = hostname;
                    hostname = ip;
                }

                if(params.allowGzip) {
                    var enc = headers['accept-encoding'];

                    if(!enc) {
                        enc = 'gzip, *';
                    } else if(enc.indexOf('gzip') === -1) {
                        enc = 'gzip, ' + enc;
                    }

                    headers['accept-encoding'] = enc;
                }

                // See https://github.com/nodejitsu/node-http-proxy/pull/338
                if(hasBody || params.method === 'DELETE') {
                    var len = headers['content-length'];
                    if(!len) {
                        len = Buffer.byteLength(body) || 0;
                    }

                    headers['content-length'] = len;
                }

                var options = {
                    method   : params.method,
                    auth     : params.auth,
                    headers  : objects.extend(
                            headers,
                            hasBody? { 'content-type' : 'application/x-www-form-urlencoded' } : {}),
                    protocol : url.protocol,
                    hostname : hostname,
                    port     : url.port,
                    path     : url.pathname + (query? '?' + query : '')
                };

                logger.debug('Requesting %s%s', URL.format(options), options.path);

                return this._doHttp(options, params.dataType, body);
            }, this);
    },

    abort : function() {
        this._curReq && this._curReq.abort();
    },

    _resolveHostname : function() {
        var host = this._url.hostname,
            ip = cache[host];

        if(ip) {
            return Vow.promise(ip);
        }

        var promise = Vow.promise();

        DNS.resolve(host, function(err, addrs) {
            if(err) {
                promise.reject(err);
                return;
            }

            ip = addrs[0];
            promise.fulfill(cache[host] = ip);
        });

        return promise;
    },

    _handleResponse : function(promise, res) {
        var _t = this,
            buf = '',
            headers = res.headers,
            charsetEncoding = this.params.encoding,
            zdecoder = getDecoderFromHeaders(headers),
            resStream = zdecoder? res.pipe(new zdecoder()) : res,
            statusCode = res.statusCode,
            resp = {
                headers : res.headers,
                statusCode : statusCode,
                reason : HTTP.STATUS_CODES[statusCode],
                data : null,
                type : ''
            };

        resStream
            .on('data', function(chunk) {
                buf += chunk.toString(charsetEncoding);
            })
            .once('end', function() {
                try {
                    var dtype = _t._dataType || getDataTypeFromHeaders(headers);

                    resp.type = dtype;
                    resp.data = processResponse(buf, dtype);

                    promise.fulfill(resp);
                }
                catch(e) {
                    logger.error('Request for %s finished with error', _t._url.href, e);
                    promise.reject(e);
                }
            })
            .once('close', function() {
                logger.error('Request for %s was closed', _t._url.href);

                // FIXME: shouldn't we `stream.destroy()`?
                promise.reject(new HttpError(500, 'connection closed'));
            });
    },

    _doHttp : function(params, dataType, body) {
        var _t = this,
            promise = Vow.promise(),
            curReq = this._curReq = (params.protocol === 'https:'? HTTPS : HTTP).request(
                params,
                function(res) {
                    var statusCode = res.statusCode;

                    // handling redirects
                    if(statusCode === 301 || statusCode === 302) {
                        if(!--_t._redirCounter) {
                            return promise.reject(new HttpError(500, 'too many redirects'));
                        }

                        var location = URL.resolve(_t._url.href, res.headers['location'] || '');
                        params = URL.parse(location, true, true);

                        logger.debug('Redirecting from %s to %s', _t._url.href, location);

                        return promise.sync(_t._doHttp(params, dataType));
                    }
                    // handling HTTP-errors
                    else if(statusCode >= 400) {
                        logger.error('Request for %s responded with error code %d', _t._url.href, statusCode);
                        return promise.reject(new HttpError(res.statusCode));
                    }

                    // common response handler
                    _t._handleResponse.call(_t, promise, res);
                });

        if(this.params.timeout) {
            curReq.setTimeout(this.params.timeout);
        }

        if(body) {
            curReq.write(body);
        }

        curReq
            .once('error', function(e) {
                logger.error('Request for %s was failed', _t._url.href, e);
                promise.reject(e);
            })
            .once('timeout', function() {
                logger.error('Request for %s was timed out', _t._url.href);

                _t.abort();
                promise.reject(new HttpError(504, 'request timeout'));
            })
            .end();

        return promise;
    },

    getDefaultParams : function() {
        return {
            method       : 'GET',
            encoding     : 'utf8',
            headers      : {},
            maxRedirects : 5,
            timeout      : null,
            'allowGzip'    : true
        };
    }

}, {

    create : function(params) {
        return new this(params);
    }

}));

});
