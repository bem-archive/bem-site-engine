bem-site-engine
========

Платформа для создания сайтов с документацией.

В настоящее время на базе данной платформы созданы и работают следующие сайты:

* [Bem-Info](http://bem.info)

### Установка, сборка и запуск

Клонируем проект:
```
$ git clone git://github.com/bem/bem-site-engine.git && cd bem-site-engine
```

Устанавливаем зависимости:
```
npm run deps
```

Собираем данные:
```
node bin/data.js
```

Запускаем сервер:
```
npm start
```

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
