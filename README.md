bem-info
========

Сайт про БЭМ. 

Сборка
------

```sh
# Клонируем
$ git clone git://github.yandex-team.ru/lego/bem-info.git
$ cd bem-info

# Собираем в dev-режиме
$ make

# Собираем в production-режиме
$ YENV=production make
```

Запуск
------

```sh
# Запускаем приложение в dev-режиме
$ npm start

# Запускаем приложение в production-режиме
$ NODE_ENV=production npm start
```

Чтобы заработали поддомены необходимо добавить в `/etc/hosts` записи:

```
127.0.0.1    localhost
127.0.0.1    ru.localhost
127.0.0.1    en.localhost
```
