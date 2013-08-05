/* jshint node:true */
/* global modules:false */

modules.define(
    'http-request',
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


provide(inherit({

    __constructor : function(params) {
        this.params = objects.extend({}, this.getDefaultParams(), params);

        var method = this.method = this.params.method.toUpperCase(),
            headers = this.params.headers;

        this.headers = Object.keys(headers).reduce(function(hdrs, key) {
            hdrs[key.toLowerCase()] = headers[key];
            return hdrs;
        }, {});

        var _params = this.params,
            url = _params.url,
            parsedUrl = typeof url === 'string'?
                URL.parse(url, true, true) : url;

        this.url = parsedUrl;
        this.dataType = _params.dataType;

        this._data = _params.data;
        this._hasBody = method === 'POST' || method === 'PUT';

        this._redirects = 0;
    },

    run : function() {
        this._redirects = this.params.maxRedirects;

        return this._resolveHostname()
            .then(function(ip) {
                if(ip) {
                    this.headers['host'] = this.url.hostname;
                    this.url.hostname = ip;
                }
                return this._doHttp();
            }, this);
    },

    abort : function() {
        this._aborted = true;

        if(this.req) {
            this.req.abort();
        }
    },

    _resolveHostname : function() {
        var host = this.url.hostname,
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

    _request : function() {
        if(this.req) {
            return this.req;
        }

        var params = this.params,
            headers = this.headers,
            method = this.method,
            hasBody = this._hasBody,
            data = this._data,
            url = this.url,
            hostname = url.hostname,
            query = url.query;

        // Content-Type
        var type = headers['content-type'],
            typeOfData = typeof data;

        if(hasBody && !type) {
            if(typeOfData === 'string') {
                type = 'application/x-www-form-urlencoded';
            }
            headers['content-type'] = type || 'application/json';
        }

        type = this.__self.getDataType(headers);

        // serialize query
        if(!hasBody) {
            if(data != null && typeOfData === 'object') {
                query = QS.stringify(objects.extend(query, data));
            }
            else if(typeOfData === 'string') {
                query = QS.stringify(query);
                if(query) {
                    query += '&';
                }
                query += encodeURIComponent(data);
            }
        }
        else {
            query = QS.stringify(query);
        }

        // TODO: serialize data (Buffer?)
        if(data != null) {
            data = type === 'json'?
                JSON.stringify(data) : QS.stringify(data);
        }
        else {
            data = '';
        }

        this._data = data;

        // Content-Length
        if(method !== 'HEAD') {
            var len = headers['content-length'];
            if(!len) {
                len = Buffer.byteLength(data) || 0;
            }
            headers['content-length'] = len;
        }

        // Accept-Encoding
        if(params.allowGzip) {
            var enc = headers['accept-encoding'];
            if(!enc) {
                enc = 'gzip, deflate';
            } else if(enc.indexOf('gzip') === -1) {
                enc = 'gzip, ' + enc;
            }
            headers['accept-encoding'] = enc;
        }

        var options = {
            auth     : params.auth,
            method   : method,
            headers  : headers,
            hostname : hostname,
            protocol : url.protocol,
            path     : url.pathname + (query? '?' + query : ''),
            port     : url.port
        };

        logger.debug('Request %s%s (%j)', URL.format(options), options.path, options);

        return this.req = (params.protocol === 'https:'? HTTPS : HTTP).request(options);
    },

    _redirect : function(promise, res) {
        if(!--this._redirects) {
            promise.reject(new HttpError(500, 'too many redirects'));
            return;
        }

        // clean up
        delete this.req;
        delete this._data;

        ['content-type', 'content-length', 'cookie', 'host'].forEach(function(name) {
            delete this.headers[name];
        }, this);

        var url = this.url,
            location = URL.resolve(url.href, res.headers['location'] || '');

        logger.debug('Redirecting from %s to %s', url.href, location);

        this.url = objects.extend(url, URL.parse(location, true, true));

        promise.sync(this._doHttp());
    },

    _processResponse : function(data, typ) {
        switch(typ) {

        case 'json':
            return JSON.parse(data);

        default:
            return data;

        }
    },

    _response : function(promise, res) {
        var _t = this,
            buf = '',
            headers = res.headers,
            statusCode = res.statusCode,
            charsetEncoding = this.params.encoding,
            zdecoder = this.__self.getDecoder(headers),
            resStream = zdecoder? res.pipe(new zdecoder()) : res,
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
            .on('end', function() {
                if(_t._aborted) {
                    // TODO: testme
                    logger.debug('Request for %s was aborted before it ended', _t.url.href);
                    promise.reject(new Error('Aborted'));
                    return;
                }

                try {
                    var dtype = _t.dataType || _t.__self.getDataType(headers);

                    resp.type = dtype;
                    resp.data = _t._processResponse(buf, dtype);

                    promise.fulfill(resp);
                }
                catch(e) {
                    logger.error('Request for %s finished with error', _t.url.href, e);
                    promise.reject(e);
                }
            })
            .once('close', function() {
                logger.error('Request for %s was closed', _t.url.href);

                // FIXME: shouldn't we `stream.destroy()`?
                promise.reject(new HttpError(500, 'connection closed'));
            });
    },

    _doHttp : function() {
        var _t = this,
            promise = Vow.promise(),
            req = this._request(),
            params = this.params,
            data = this._data;

        if(params.timeout) {
            req.setTimeout(params.timeout);
        }

        if(data) {
            req.write(data);
        }

        req.on('response', function(res) {
            console.log('Response');
            var statusCode = res.statusCode;

            // handling HTTP-errors
            if(statusCode >= 400) {
                logger.error('Request for %s responded with error code %d', _t.url.href, statusCode);
                promise.reject(new HttpError(res.statusCode));
                return;
            }
            // handling redirects
            else if(statusCode >= 300) {
                _t._redirect.call(_t, promise, res);
                return;
            }

            // common response handler
            _t._response.call(_t, promise, res);
        })
        .once('error', function(e) {
            if(_t._aborted) {
                logger.debug('Request for %s was aborted before', _t.url.href);
                return;
            }

            logger.error('Request for %s was failed', _t.url.href, e);
            promise.reject(e);
        })
        .once('timeout', function() {
            logger.error('Request for %s was timed out', _t.url.href);

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
            allowGzip    : true
        };
    }

}, {

    create : function(params) {
        return new this(params);
    },

    getDataType : function(headers) {
        var contentType = headers['content-type'];
        if(contentType && contentType.indexOf('json') > -1) {
            return 'json';
        }
        return 'text';
    },

    getDecoder : function(headers) {
        var encoding = headers['content-encoding'];
        switch(encoding) {

        case 'gzip':
            return ZLIB.Gunzip;

        case 'deflate':
            return ZLIB.Inflate;

        }
    }

}));

});
