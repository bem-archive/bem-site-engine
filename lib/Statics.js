var url = require('url');

function Statics(baseUrl) {
    this._url = (typeof baseUrl === 'object') ? url.format(baseUrl) : baseUrl;
    this._parsedUrl = url.parse(this._url);
}

Statics.prototype.getUrl = function(localPath) {
    return this._url + localPath;
};

exports.Statics = Statics;
