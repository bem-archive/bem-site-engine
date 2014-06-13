var GhApiProvider = require('./provider-gh-api').GhApiProvider,
    FileProvider = require('./provider-file').FileProvider,
    GhHttpsProvider = require('./provider-gh-https').GhHttpsProvider,
    YaDiskProvider = require('./provider-ya-disk').YaDiskProvider;

var providerFile,
    providerGhApi,
    providerGhHttps,
    providerYaDisk;

module.exports = {

    getProviderFile: function() {
        providerFile = providerFile || new FileProvider();
        return providerFile;
    },

    getProviderGhApi: function() {
        providerGhApi = providerGhApi || new GhApiProvider();
        return providerGhApi;
    },

    getProviderGhHttps: function() {
        providerGhHttps = providerGhHttps || new GhHttpsProvider();
        return providerGhHttps;
    },

    getProviderYaDisk: function() {
        providerYaDisk = providerYaDisk || new YaDiskProvider();
        return providerYaDisk;
    }
};

