![BEM:true](http://img.shields.io/badge/bem-true-yellow.svg?style=flat)

bem-site-engine
========

Платформа для создания сайтов с документацией.

В настоящее время на базе данной платформы созданы и работают следующие сайты:

* [bem.info](https://bem.info/)

### Установка, сборка и запуск

Клонируем проект:
```
$ git clone git://github.com/bem/bem-site-engine.git && cd bem-site-engine
```

Нужно сгенерировать [токен](https://help.github.com/articles/creating-an-access-token-for-command-line-use/) (выбрать scope – `repo:status` и `public_repo`) и вставить его в конфиг [configs/common/app.json](https://github.com/bem/bem-site-engine/blob/dev/configs/common/app.json#L36).

##### Установка, сборка данных и запуск приложения одной командой

```
npm run make
```

##### Команды

* Установка зависимостей: `npm i && npm run postinst`
* Запуск сервера: `npm start`
* Удаление логов: `npm run clean_logs`
* Удаление кеша примеров блоков: `npm run clean_cache`
* Удаление всех собранных данных: `npm run clean_data`
* Запуск тестов jshint и jscs: `npm run test`

Сборка данных:

* development: `node bin/data.js development`
* testing: `node bin/data.js testing`
* production: `node bin/data.js production -v latest`

Более подробно о командах сборки данных можно прочитать в [Соответствующем руководстве](./docs/data_compiling.ru.md).

### Документация

* [Создание модели](./docs/model.ru.md)
* [Конфигурация](./docs/config.ru.md)
* [Описание middleware модулей](./docs/middleware.ru.md)
* [Описание процесса сборки](./docs/data_compiling.ru.md)

Ответственные за разработку:

* [Андрей Кузнецов](https://github.com/tormozz48)
* [Николай Ильченко](https://github.com/tavriaforever)
* [Владимир Гриненко](https://github.com/tadatuta)
* [Андрей Абрамов](https://github.com/andrewblond)
* [Дмитрий Белицкий](https://github.com/dab)
