(function() {

var DNS = require('dns'),
    HTTP = require('http'),
    HTTPS = require('https'),
    URL = require('url'),
    QS = require('querystring'),
    ZLIB = require('zlib'),

    // DNS cache resolved
    cache = [];


modules.define(
    'http-provider',
    ['inherit', 'next-tick', 'objects', 'vow', 'yana-error_type_http'],
    function(provide, inherit, nextTick, objects, Vow, HttpError) {

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
                    URL.parse(url, true) : url;

        this._hasBody = _params.method === 'POST' || _params.method === 'PUT';
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
                                hasBody? url.query : objects.extend(url.query, params.data));
                    hostname = url.hostname,
                    headers = params.headers || {},
                    options = {};
                    
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
                    
                    headers['content-length'] = len;
                }

                options = {
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
                
                return this._doHttp(options, params.dataType, body);
            }.bind(this));
    },

    abort : function() {
        this._curReq && this._curReq.abort();
    },

    _resolveHostname : function() {
        var host = this._url.hostname;

        if(cache[host]) {
            return Vow.promise(cache[host]);
        }

        var promise = Vow.promise();

        DNS.resolve(host, function(err, addrs) {
            if(err) {
                return promise.reject(err);
            }

            var ip = addrs[0];
            promise.fulfill(cache[host] = ip);

            return;
        });

        return promise;
    },

    _doHttp : function(params, dataType, body) {
        var _t = this,
            promise = Vow.promise();

        this._curReq = (params.protocol === 'https:'? HTTPS : HTTP).request(
                params,
                function(res) {
                    if(res.statusCode === 301 || res.statusCode === 302) {
                        return --_t._redirCounter?
                            // TODO: testme
                            promise.sync(_t._doHttp(URL.parse(res.headers['location'], true), dataType)) :
                            promise.reject(new Error(500, 'too many redirects'));
                    }
                    else if(res.statusCode >= 400) {
                        return promise.reject(new Error(res.statusCode));
                    }

                    var buf = '',
                        headers = res.headers,
                        charsetEncoding = _t.params.encoding,
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
                            catch(err) {
                                promise.reject(err);
                            }
                        })
                        .once('close', function() {
                            promise.reject(new HttpError(500, 'connection closed'));
                        });
                });

        this.params.timeout &&
            this._curReq.setTimeout(this.params.timeout);

        body && this._curReq.write(body);

        this._curReq
            .once('error', function(e) {
                promise.reject(e);
            })
            .once('timeout', function(e) {
                this.abort();
                promise.reject(new HttpError(504, 'request timeout'));
            })
            .end();

        return promise;
    },

    getDefaultParams : function() {
        return {
            'method'       : 'GET',
            'encoding'     : 'utf8',
            'maxRedirects' : 5,
            'timeout'      : null,
            'allowGzip'    : true
        };
    }

}, {

    create : function(params) {
        return new this(params);
    }

}));

});

}());