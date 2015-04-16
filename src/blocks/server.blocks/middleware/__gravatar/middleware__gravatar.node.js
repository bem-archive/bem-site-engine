modules.define('middleware__gravatar', function (provide) {

    var crypto = require('crypto');

    provide(function () {
        return function (req, res, next) {
            var data = req.__data,
                node = data.node,
                email = node.email && node.email[req.lang],
                hash = email && crypto.createHash('md5').update(email, 'utf8').digest('hex');

            if (!email) return next();

            data.gravatarUrl = email ? 'https://www.gravatar.com/avatar/' + hash + '?s=240' : '';

            return next();
        };
    });
});
