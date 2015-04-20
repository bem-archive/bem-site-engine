var url = require('url'),
    util = require('util'),
    _ = require('lodash'),
    MDS = require('mds-wrapper');

modules.define('storage', ['logger', 'config'],
    function (provide, logger, config) {
        var mds;

        provide({

            getStorage: function () {
                mds = mds || new MDS(config.get('mds'));
                return mds;
            },

            read: function (url, callback) {
                this.getStorage().read(arguments);
            },

            getFullUrl: function (url) {
                return this.getStorage().getFullUrl(url);
            }
        });
    }
);

