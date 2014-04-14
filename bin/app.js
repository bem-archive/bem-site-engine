#!/usr/bin/env node

var config = require('../src/config'),
    launcher;

if ('development' === config.get('NODE_ENV')) {
    launcher = require('../src/app.js');
} else {
    launcher = require('../src/cluster');
}

launcher.run();
