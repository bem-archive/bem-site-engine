var url = require('url'),
    util = require('util'),
    _ = require('lodash'),
    request = require('request'),
    MDS = require('mds-wrapper');

modules.define('storage', ['logger', 'config'],
    function (provide, logger, config) {
        logger = logger(module);


        var MODES = { MDS: 0, HTTP: 1 },
            mode = MODES.MDS,
            mds = new MDS(config.get('mds')),
            http = {
                read: function (url, callback) {
                    var c = config.get('http'),
                        host = c.host,
                        port = c.port,
                        _url = url.format({
                            protocol: 'https',
                            hostname: host,
                            port: port,
                            pathname: url
                        });

                    request.get(_url, function (error, response, body) {
                        error ? callback(error) : callback(null, body);
                    });
                },

                getFullUrl: function (url) {
                    var c = config.get('http'),
                        host = c.host,
                        port = c.port;
                    return util.format('https://%s:%s/%s', host, port, url);
                }
            };

        provide({

            // this method should be overrided for using other service
            init: function() {
                mode = MODES.MDS;
            },

            read: function (url, callback) {
                var s = mode === MODES.MDS ? mds : http;
                s.read(arguments);
            },

            getFullUrl: function (url) {
                var s = mode === MODES.MDS ? mds : http;
                return s.getFullUrl(url);
            }
        });
    }
);

