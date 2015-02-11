# Руководство по конфигурированию приложения

Для конфигурирования данного приложения используется модуль [nconf](https://www.npmjs.org/package/nconf)

Файлы конфигурации находятся в папке [configs](./configs) и распределены по 4 папкам:

* [common](./configs/common) - файлы общие для всех видов окружений
* [dev](./configs/dev) - специальные настройки для `dev` окружения
* [testing](./configs/testing) - специальные настройки для `testing` окружения
* [production](./configs/production) - специальные настройки для `production` окружения

При этом параметры настроек для `dev`, `testing` или `production` окружений имеют приоритет над
соответствующими параметрами общих настроек [common](./configs/common)

### Детальное описание настроек приложения

#### common/common.json

```
{
    "defaultLanguage": "en",
    "languages": ["en", "ru"],
    "port": 3016,
    "title": {
        "en": "Your application title",
        "ru": "Название вашего приложения"
    },
    "update": {
        "enable": true,
        "cron": "0 */1 * * * *"
    },
    "logger": {
        "level": "debug",
        "stdout": "./logs/stdout.log",
        "stderr": "./logs/stderr.log"
    },
    "statics": "",
    "metrika": "",
    "github": {
        "public": {
            "token": []
        },
        "people": ""
    },
    "mds": {
        "namespace": "your application namespace",
        "get": {
            "host": "mds host for read requests"
        },
        "post": {
            "host": "mds host for write requests"
        },
        "auth": "your application mds auth token",
        "timeout": 300000
    },
    "yandex-disk": {
        "user": "",
        "password": "",
        "namespace": ""
    },
    "hosts": {
        "en": "your application host",
        "ru": "your application host"
    }
}
```

* `defaultLanguage` - язык сайта по умолчанию.
* `languages` - массив со строками, обозначающими локализации, присутствующие на сайте.
* `port` - порт или путь к socket - файлу на котором будет запущен сервер.
* `title` - объект с ключами совпадающими с именами локалей для сайта и значениями.
которые будут представлены в качестве title страниц сайта.
* `update` - объект с настройками модуля проверки обновления данных.
Необходим для запуска сайта в тестовом или боевом окружениях.
* `logger` - объект с настроками путей для хранения файлов логов и уровня логгирования сайта.
Доступные значения уровня логгирования `verbose`, `debug`, `info`, `warn`, `error`.
* `statics` - объект в котором указывается путь к статическим файлам, необходимым при работе сайта.
* `github:public` - объект с параметрами, необходимыми для работы github API по которому загружается
документация в процессе сборки данных для сайта.
* `github:people` - строка url браузере на страницу github с json файлом в котором хранится информация об авторах и
переводчиках, например `https://github.com/bem/bem-site-engine/blob/dev/docs/people/people.json`
* `hosts` - объект с ключами совпадающими с именами локалей для сайта и значениями в качестве которых
должны быть представлены названия хостов сайта для соответствующих локалей. Данная настройка
необходима для автоматического построения файла `sitemap.xml` в процесе сборки данных для сайта.

Переключение конфигураций осуществляется путем создания симлинка `current`
на одну из папок соответсвующих конфигурации определенного окружения `configs/dev`, `configs/testing`, `configs/production`
