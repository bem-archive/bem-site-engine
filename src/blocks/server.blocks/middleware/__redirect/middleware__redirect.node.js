var path = require('path');

modules.define('middleware__redirect', ['logger', 'util', 'model'], function(provide, logger, util, model) {

    logger = logger(module);

    var redirects = [];

    /**
     * Middleware for old url redirects
     * @returns {Function}
     */
    provide({
        init: function() {
            try {
                redirects = require(path.join(process.cwd(), 'configs/common/redirects.js'));
            }catch(err) {
                logger.warn('redirects.js file was not found in configs/common directory');
            }
            redirects = redirects.concat(model.getRedirects());
        },

        run: function() {
            this.init();

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
        }
    });
});
