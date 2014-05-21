#!/usr/bin/env node

var config = require('../src/config'),
    launcher = 'development' === config.get('NODE_ENV') ?
        require('../src/app.js') : require('../src/cluster');

launcher.run();
