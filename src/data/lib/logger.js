var intel = require('intel'),
    config = require('./config');

//set logger verbosity level from configuration file
intel.setLevel('debug');

//add console logger handler
intel.addHandler(
    new intel.handlers.Console({
        level: intel.VERBOSE,
        formatter: new intel.Formatter({
            format: '[%(date)s] %(levelname)s %(name)s: %(message)s',
            colorize: true
        })
    })
);

module.exports = function(module) {
    var name = module ? module.filename.split('/').slice(-2).join('/') : '';
    return intel.getLogger(name);
};