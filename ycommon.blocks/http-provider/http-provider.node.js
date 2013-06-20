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
        var _params = this.params = objects.extend(this.getDefaultParams(), params),
            url = _params.url,
            parsedUrl = typeof url === 'string'?
                    URL.parse(url, true, true) : url;

        this._hasBody = _params.method === 'POST' || _params.method === 'PUT';
        this._dataType = _params.dataType;
        this._redirCounter = _params.maxRedirects;

        this._url = parsedUrl;
    },

    run : function() {
        var params = this.params,
            hasBody = this._hasBody,
            body = hasBody? QS.stringify(params.data) : '';

        return this._resolveHostname()
            .then(function(ip) {
                var url = this._url,
                    query = QS.stringify(
                        hasBody? objects.extend(url.query, params.data) : url.query),
                    hostname = url.hostname,
                    headers = params.headers || {};

                if(ip) {
                    headers['Host'] = hostname;
                    hostname = ip;
                }

                if(params.allowGzip) {
                    var enc = headers['Accept-Encoding'];

                    if(!enc) {
                        enc = 'gzip, *';
                    } else if(enc.indexOf('gzip') === -1) {
                        enc = 'gzip, ' + enc;
                    }

                    headers['Accept-Encoding'] = enc;
                }

                // See https://github.com/nodejitsu/node-http-proxy/pull/338
                if(hasBody || params.method === 'DELETE') {
                    var len = headers['Content-Length'];
                    if(!len) {
                        len = Buffer.byteLength(body) || 0;
                    }

                    headers['Content-Length'] = len;
                }

                var options = {
                    method   : params.method,
                    auth     : params.auth,
                    headers  : objects.extend(
                            headers,
                            hasBody? { 'Content-Type' : 'application/x-www-form-urlencoded' } : {}),
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
            resStream = zdecoder? res.pipe(new zdecoder()) : res;

        resStream
            .on('data', function(chunk) {
                buf += chunk.toString(charsetEncoding);
            })
            .once('end', function() {
                try {
                    var dtype = _t._dataType || getDataTypeFromHeaders(headers);
                    promise.fulfill(processResponse(buf, dtype));
                }
                catch(e) {
                    logger.error('Request for %s finished with error', _t._url.href, e);
                    promise.reject(e);
                }
            })
            .once('close', function() {
                logger.error('Request for %s was closed', _t._url.href);

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

                        // TODO: testme
                        return _t._doHttp(params, dataType);
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
                logger.error('Request for %s was failed', _t._url.href, e, curReq);
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
