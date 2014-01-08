var winston = require('winston'),
    expressWinston = require('express-winston'),
    config = require('../config');

exports.errorLogger = function() {
    return expressWinston.errorLogger({
        transports: [
            new winston.transports.Console({
                colorize: true
            })
        ]
    });
};

exports.infoLogger = function() {
    return expressWinston.logger({
        transports: [
            new winston.transports.File({
                level: config.get('app:logger:level'),
                filename: config.get('app:logger:stdout')
            }),
            new winston.transports.Console({
                colorize: true
            })
        ],
        meta: false,
        msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}}"
    })
};
