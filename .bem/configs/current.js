var BEM = require('bem');

//process.env.YENV = 'production';

module.exports = {

    libraries : BEM.util.extend(require('legoa-repodb'), {
        'bem-controls' : {
            type : 'git',
            url  : 'git://github.com/ymaps/bem-controls.git'
        },
        'islands-controls' : {
            type : 'git',
            url  : 'git://github.yandex-team.ru/maps/islands-controls.git'
        }
    })

};
