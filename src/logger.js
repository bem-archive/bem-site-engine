var winston = require('winston'),
    config = require('./config');

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
},
container = new winston.Container({
    exceptionHandlers: [
        new winston.transports.File({ filename: config.get('logger:stderr') })
    ],
    levels: levels.levels,
    exitOnError: false
});

module.exports = function(module) {
    var label = new Date() + ' ';

    label += module ? module.filename.split('/').slice(-2).join('/') : '';

    winston.addColors(levels.colors);

    container.add(module.filename, {
        transports: [
            new winston.transports.File({
                level: config.get('logger:level'),
                filename: config.get('logger:stdout'),
                label: label,
                timestamp: false,
                json: false
            }),
            new (winston.transports.Console)({
                level: config.get('logger:level'),
                handleExceptions: true,
                colorize: true,
                label: label
            })
        ]
    });

    return container.get(module.filename);
};
