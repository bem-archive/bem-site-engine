bem-info
=====

Сайт документации по bem

## Как поднять копию ##

### 1 Клонируем репозиторий

```
% git clone -b bem-info git@github.yandex-team.ru:lego/bem-info.git bem-info
% cd bem-info
```

### 2 Устанавливаем сборщик данных как git submodule

```
% git submodule add https://github.com/tormozz48/bem-info-source datasrc
```

### 3. Устанавливаем зависимости

```
% npm install
% bem make libs
```

### 4. Собираем

```
% bem make desktop.bundles
```

### 5. Запускаем локально

Если хочется разрабатываться локально, необходимо запускать приложение TCP-порте, вместо сокета. Для этого случая
необходимо использовать набор конфигов `local`, которые обеспечивают старт приложения на порту `process.env.PORT`
(по умолчанию 3014):

```
% cd configs
% ln -snf local current
% cd ..
```

Так же необходимо позаботится о раздаче статики (JS/CSS). Например, для этих целей, можно использовать bem-server.
Запускам bem-server на порту 8001 в другой сессии терминала:

```
% bem server -p 8001
```

Как альтернативу bem-server удобно использовать  `python -m CGIHTTPServer` (запускается по умолчанию на 8000 порту)

Стартуем приложение:

```
% npm start
```

Проверяем http://127.0.0.1:3014

### 6. Собираем данные

Для сборки данных необходимо:

* перейти в директорию `datasrc` - `cd datasrc`
* подтянуть зависимые библиотеки - `npm install`
* запустить саму сборку - `bem make`

### Контакты

@lego-team:

* [@bemer](http://staff/bemer)
* [@lesanra](http://staff/lesanra)

