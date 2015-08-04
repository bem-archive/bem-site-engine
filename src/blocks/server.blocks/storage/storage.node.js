var MDS = require('mds-wrapper');

modules.define('storage', ['logger', 'config'],
    function (provide, logger, config) {

        var storage;
        provide({

            init: function () {
                storage = new MDS(config.get('mds'));
                return storage;
            },

            read: function (url, callback) {
                storage.read(url, callback);
            },

            getFullUrl: function (url) {
                storage.getFullUrl(url);
            }
        });
    }
);

