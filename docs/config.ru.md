# Руководство по конфигурированию приложения

Для конфигурирования данного приложения используется модуль [nconf](https://www.npmjs.org/package/nconf)

Файлы конфигурации находятся в папке [configs](./configs) и распределены по 4 папкам:

* [common](./configs/common) - файлы общие для всех видов окружений
* [dev](./configs/dev) - специальные настройки для `dev` окружения
* [testing](./configs/testing) - специальные настройки для `testing` окружения
* [production](./configs/production) - специальные настройки для `production` окружения

При этом параметры настроек для `dev`, `testing` или `production` окружений имеют приоритет над
соответствующими параметрами общих настроек [common](./configs/common)

При этом для каждого уровня переопределения конфигурации `common`, `dev`, `testing` и `production`,
настройки распределены по файлам: `common.json`, `app.json` и `data.json` 
(отдельные файлы могут отстутсвовать для некоторых окружений), где:

* `common.json` - файлы с настройками, которые используются и в процессе сборки данных и для запуска и работы сайта
* `app.json` - файлы с настройками, которые используются только для запуск и работы сайта
* `data.json` - файлы с настройками, которые используются только в процессе сборки данных для сайта

### Детальное описание настроек приложения

#### common/common.json

```
{
    "common": {
        "languages": ["en", "ru"],
        "yandexApi": {
            "login": "",
            "password": ""
        },
        "model": {
            "dir": "bem-site-engine",
            "data": "data.json",
            "marker": "marker.json",
            "search": {
                "libraries": "search_libraries.json",
                "blocks": "search_blocks.json"
            }
        },
        "github": {
            "libraries": {
                "type": "public",
                "user": "",
                "repo": "",
                "ref": "master",
                "pattern": "https://raw.githubusercontent.com/%s/%s/%s%s"
            }
        }
    }
}
```

* languages - массив со строками, обозначающими локализации, присутствующие на сайте
* yandexApi - объект с полями `login` и `password`. Необходим для доступа к Yandex Disk, в случае когда сайт запускается в тестовом или боевом окружениях.
* model - объект с полями, обозначающими названия файлов в которые сохраняются модель сайта, данные поиска и.т.д.
* github:libraries - объект с полями, указывающими на ветку репозитория в котором хранятся собранные данные для библиотек блоков.

#### common/app.json

```
{
    "app": {
        "defaultLanguage": "ru",
        "title": {
            "en": "Your application title",
            "ru": "Название приложения"
        },
        "luster": {
            "workers": 4,
            "control": {
                "forkTimeout": 1000,
                "stopTimeout": 1000,
                "exitThreshold": 3000,
                "allowedSequentialDeaths": 3
            },
            "server": {
                "port": "socket or port name",
                "groups": 1
            }
        },
        "update": {
            "enable": true,
            "cron": "0 */1 * * * *"
        },
        "logger": {
            "level": "debug",
            "stdout": "/logs/stdout.log",
            "stderr": "/logs/stderr.log"
        },
        "statics": {
            "www": "",
            "pathname": "/m"
        }
    }
}
```

* defaultLanguage - язык сайта по умолчанию
* title - объект с ключами совпадающими с именами локалей для сайта и значениями
которые будут представлены в качестве title страниц сайта
* luster -  объект с настройками модуля кластеризации [luster](https://www.npmjs.org/package/luster).
Необходим для запуска сайта в тестовом или боевом окружениях.
* update - объект с настройками модуля проверки обновления данных. 
Необходим для запуска сайта в тестовом или боевом окружениях.
* logger - объект с настроками путей для хранения файлов логов и уровня логгирования сайта
Доступные значения уровня логгирования `verbose`, `debug`, `info`, `warn`, `error`.
* statics - объект в котором указывается путь к статическим файлам, необходимым при работе сайта.
