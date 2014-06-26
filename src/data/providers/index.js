var GhApiProvider = require('./provider-gh-api').GhApiProvider,
    FileProvider = require('./provider-file').FileProvider,
    GhHttpsProvider = require('./provider-gh-https').GhHttpsProvider,
    YaDiskProvider = require('./provider-ya-disk').YaDiskProvider;

var providerFile,
    providerGhApi,
    providerGhHttps,
    providerYaDisk;

module.exports = {

    /**
     * Returns module which provide all operations with files on local filesystem
     * @returns {*|FileProvider}
     */
    getProviderFile: function() {
        providerFile = providerFile || new FileProvider();
        return providerFile;
    },

    /**
     * Returns module which provide all operations via github API
     * @returns {*|GhApiProvider}
     */
    getProviderGhApi: function() {
        providerGhApi = providerGhApi || new GhApiProvider();
        return providerGhApi;
    },

    /**
     * Returns module which provides operations via https protocol
     * @returns {*|GhHttpsProvider}
     */
    getProviderGhHttps: function() {
        providerGhHttps = providerGhHttps || new GhHttpsProvider();
        return providerGhHttps;
    },

    /**
     * Returns module which provides operations via Yandex Disk API
     * @returns {*|YaDiskProvider}
     */
    getProviderYaDisk: function() {
        providerYaDisk = providerYaDisk || new YaDiskProvider();
        return providerYaDisk;
    }
};

