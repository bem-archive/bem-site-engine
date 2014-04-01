#!/usr/bin/env node

var path = require('path'),
    config = require('../src/config');

if ('development' === config.get('NODE_ENV')) {
    var nodemon = require('nodemon'),
        config = require(path.join(process.cwd(), 'configs', 'current', 'nodemon'));

    config.script = require.resolve('../src/app.js'),

        nodemon(config)
            .on('start', function() {
                console.log('nodemon started');
            })
            .on('crash', function() {
                console.log('script crashed for some reason');
            });

} else {
    require('../src/cluster').run();
}
