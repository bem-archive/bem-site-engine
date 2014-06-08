var util = require('util'),
    config = require('../config');

module.exports = function() {

    return function(req, res, next) {

        var node = req.__data.node,
            lang = {
                en: 'ru',
                ru: 'en'
            }[req.lang],
            host = req.headers.host.replace(util.format('%s.', req.lang), ''),
            url = util.format('//%s.%s%s', lang, host, node.hidden[lang] ? '/' : req.path);

        req.__data.langSwitch = url;
        return next();
    };
};
