var winston = require('winston'),
    config = require('./config');

module.exports = function(module) {
    var label = new Date() + ' ',
        i = -2;
    label += module ? module.filename.split('/').slice(i).join('/') : '';

    var levels = {
        levels: {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        },
        colors: {
            debug: 'blue',
            info: 'green',
            warn: 'orange',
            error: 'red'
        }
    };

    winston.addColors(levels.colors);

    return new (winston.Logger)({
        transports: [
            new winston.transports.File({
                level: config.get('app:logger:level'),
                filename: config.get('app:logger:stdout'),
                label: label,
                timestamp: false,
                json: false
            }),
            new (winston.transports.Console)({
                level: config.get('app:logger:level'),
                handleExceptions: true,
                colorize: true,
                label: label
            })
        ],
        exceptionHandlers: [
            new winston.transports.File({ filename: config.get('app:logger:stderr') })
        ],
        levels: levels.levels,
        exitOnError: false
    });
};
