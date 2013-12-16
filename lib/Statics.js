var URL = require('url');

var Statics = function(baseUrl) {
    this._url = ('object' === typeof baseUrl) ? URL.format(baseUrl) : baseUrl;
    this._parsedUrl = URL.parse(this._url);
};

Statics.prototype.getUrl = function(localPath) {
    return URL.resolve(this._url, localPath);
};

exports.Statics = Statics;