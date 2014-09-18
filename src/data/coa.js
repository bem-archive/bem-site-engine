'use strict';

module.exports = require('coa').Cmd()
    .name(process.argv[1])
    .title('Bem-Site engine data builder')
    .helpful()
    .cmd().name('development').apply(require('./commands/development')).end()
    .cmd().name('testing').apply(require('./commands/testing')).end()
    .cmd().name('production').apply(require('./commands/production')).end()
    .completable();



