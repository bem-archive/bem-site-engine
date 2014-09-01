var path = require('path');

modules.define('middleware__redirect', ['logger', 'util'], function(provide, logger, util) {

    logger = logger(module);

    var redirects = [];

    try {
        redirects = require(path.join(process.cwd(), 'configs', 'common', 'redirects.js'));
    }catch(err) {
        logger.warn('redirects file was not found in configs/common directory');
    }

    /**
     * Middleware for old url redirects
     * @returns {Function}
     */
    provide(function() {
        return function(req, res, next) {
            var url = req.path,
                redirect = redirects.filter(function(item) {
                return item[0].exec(url);
            })[0];

            if(!redirect) {
                return next();
            }

            var match = url.match(redirect[0]),
                target = redirect[1];

            for(var i = 1; i < match.length; i++) {
                target = target.replace('$' + i, match[i]);
            }
            return res.redirect(target);
        };
    });
});
