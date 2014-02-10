var intel = require('intel'),
    config = require('./config');

intel.setLevel(config.get('logger:level'));

intel.addHandler(
    new intel.handlers.Console({
        level: intel.VERBOSE,
        formatter: new intel.Formatter({
            format: '[%(date)s] %(levelname)s %(name)s: %(message)s',
            colorize: true
        })
    })
);

intel.addHandler(
    new intel.handlers.File({
        file: config.get('logger:stdout'),
        level: intel.INFO,
        formatter: new intel.Formatter({
            format: '[%(date)s] %(levelname)s %(name)s: %(message)s',
            colorize: true
        })
    })
)

module.exports = function(module) {
    var name = module ? module.filename.split('/').slice(-2).join('/') : '';
    return intel.getLogger(name);
};