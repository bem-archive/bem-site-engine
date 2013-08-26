var extend = require('bem').util.extend;

module.exports = {
    libraries : extend(require('legoa-repodb'), {
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
