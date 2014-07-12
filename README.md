bem-site-engine
========

Платформа для создания сайтов с документацией.

В настоящее время на базе данной платформы созданы и работают следующие сайты:

* [Bem-Info](http://bem.info)

### Установка, сборка и запуск

```
$ git clone git://github.com/bem/bem-site-engine.git
$ cd bem-engine
$ make
$ node bin/data.js
$ npm start
```

Чтобы заработали поддомены необходимо добавить в `/etc/hosts` записи:

```
127.0.0.1    localhost
127.0.0.1    ru.localhost
127.0.0.1    en.localhost
```

### Документация

* [Создание модели](./docs/model.ru.md)
* [Конфигурация](./docs/config.ru.md)
* [Описание middleware модулей](./docs/middleware.ru.md)
* [Описание процесса сборки](./docs/data_compiling.ru.md)

Ответственные за разработку:

@bemer
@tavria
@tadatuta
@blond
@dmytry
