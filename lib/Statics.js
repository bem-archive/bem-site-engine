var url = require('url');

var Statics = function(baseUrl) {
    this._url = ('object' === typeof baseUrl) ? url.format(baseUrl) : baseUrl;
    this._parsedUrl = url.parse(this._url);
};

Statics.prototype.getUrl = function(localPath) {
    return this._url + localPath;
};

exports.Statics = Statics;