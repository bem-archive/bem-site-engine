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
                filename: config.get('app:logger:stdout'),
                timestamp: false,
                json: false
            }),
            new winston.transports.Console({
                colorize: true,
                json: false
            })
        ],
        meta: false//,
        //msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}}"
    })
};
