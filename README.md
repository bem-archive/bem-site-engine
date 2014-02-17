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
$ npm start
```

Чтобы заработали поддомены необходимо добавить в `/etc/hosts` записи:

```
127.0.0.1    localhost
127.0.0.1    ru.localhost
127.0.0.1    en.localhost
```

#### Генерация документации.

Для работы приложения необходимо также сгенерировать документацию и положить ее на файловую систему.
Для этого выполните команду

```
make doc_loader
```

Ответственные за разработку:

@bemer
@blond