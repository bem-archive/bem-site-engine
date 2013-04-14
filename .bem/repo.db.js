/**
 * XXX: UNDER DEVELOPMENT
 *
 * Репозиторий библиотек
 *
 * Структура
 *
 *   { id : { lib-description }, ... }
 *
 * Описание
 * - библиотеки устанавливаются в `LIB_ROOT/id` (.bem/environ.js)
 * - реквизиты библиотеки (type, url, ...) могут быть переопределены
 *   в конфиге окружения, .bem/configs/current
 */

module.exports = {

    'bem-bl' : {
        type     : 'git',
        url      : 'git://github.com/bem/bem-bl.git',
        treeish  : '0.3'
    },
    'bem-core' : {
        type     : 'git',
        url      : 'git://github.com/bem/bem-core.git'
    },
    'bem-json' : {
        type     : 'git',
        url      : 'git://github.com/delfrrr/bem-json.git'
    },
    'bem-pr' : {
        type     : 'git',
        url      : 'git://github.com/narqo/bem-pr.git'
    },
    'bem-gen-doc' : {
        type     : 'git',
        url      : 'git://github.com/bem/bem-gen-doc.git',
        treeish  : 'make'
    },
    'bem-controls' : {
        type     : 'git',
        url      : 'git://github.com/bem/bem-controls.git'
    },
    'bem-yana' : {
        type     : 'git',
        url      : 'git://github.com/narqo/bem-yana.git'
    },
    'islands-controls' : {
        type     : 'git',
        url      : 'git://github.yandex-team.ru/lego/islands-controls.git'
    },
    'islands-user' : {
        type     : 'git',
        url      : 'git://github.yandex-team.ru/lego/islands-user.git'
    },
    'islands-popups' : {
        type     : 'git',
        url      : 'git://github.yandex-team.ru/lego/islands-popups.git'
    },
    'islands-search' : {
        type     : 'git',
        url      : 'git://github.yandex-team.ru/lego/islands-search.git'
    },
    'islands-page' : {
        type     : 'git',
        url      : 'git://github.yandex-team.ru/lego/islands-page.git'
    },
    'islands-services' : {
        type     : 'git',
        url      : 'git://github.yandex-team.ru/lego/islands-services.git'
    },
    'islands-media' : {
        type     : 'git',
        url      : 'git://github.yandex-team.ru/lego/islands-media.git'
    },
    'islands-dynamic' : {
        type     : 'git',
        url      : 'git://github.yandex-team.ru/lego/islands-dynamic.git'
    },
    'romochka' : {
        type     : 'git',
        url      : 'git://github.yandex-team.ru/lego/romochka.git'
    }
};
