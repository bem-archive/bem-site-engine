legoa
=====

Сайт Лего-плафтормы

http://planner.yandex-team.ru/project/10690

### Как поднять копию ###

#### 1. Клонируем репозиторий

```
% git clone -b dev git://<...>/legoa-www.git ~/web/legoa
% cd ~/web/legoa
```

#### 2. Устанавливаем зависимости

```
% npm install
% bem make libs
```

#### 3. Собираем 

```
% bem make desktop.bundles
```

#### 4. Запускаем

Из коробки, проект ожидает, что он будет запущен в связке с Nginx-сервером который будет слушать сокет
сокет, поднятый node.js-приложением, а так же отвечать за раздачу статики.

Вся необходимая инфраструктура для разработки уже настроена на dev-сервере `coal.dev.yandex.net`: на сервере
крутится Nginx, слушающий запросы вида `<project>.<user>.coal.dev.yandex-team.ru`. Для каждого такого запроса, сервер
ожидает что, корень проекта (`root`) будет находиться в `/home/$user/web/$project` и попытается проксировать запросы 
в nodejs сокет по пути: `http://unix:/tmp/$user-$project-www.sock`.

*По вопросам связанными с `coal.dev` обращаться к @varankinv*

**TODO** Эту часть нужно сделать более универсальной!

Все, что нужно изменить разработчику, это имя сокета, который поднимает Node.js: в конфиге 
`configs/current/node.js` изменяем часть про $user в переменной `socketPath`:

```diff
diff --git a/configs/development/node.js b/configs/development/node.js
index f4a6c9c..6439c46 100644
--- a/configs/development/node.js
+++ b/configs/development/node.js
@@ -2,7 +2,7 @@ var OS = require('os'),
     PATH = require('path'),
     appRoot = PATH.resolve(__dirname, '../../'),
     socketPath = PATH.join(
-        OS.tmpDir(), ''.concat('username-', PATH.basename(appRoot), '-www.sock'));
+        OS.tmpDir(), ''.concat('varankinv-', PATH.basename(appRoot), '-www.sock'));

```

После этого запускаем Node.js-приложение:

```shell
% npm start

> legoa-www@0.0.0 start /home/varankinv/web/legoa
> nodemon -w desktop.bundles/ -e node.js,bemtree.js,bemhtml.js -d 1 ./desktop.bundles/common/_common.node.js

4 Jul 14:41:00 - [nodemon] v0.7.8
4 Jul 14:41:00 - [nodemon] to restart at any time, enter `rs`
4 Jul 14:41:00 - [nodemon] watching: /home/varankinv/web/legoa/desktop.bundles
4 Jul 14:41:00 - [nodemon] starting `node ./desktop.bundles/common/_common.node.js`
4 Jul 14:41:00 - [nodemon] reading ignore list
[Thu, 04 Jul 2013 10:41:00 GMT] DEBUG Trying unlink socket "/tmp/varankinv-legoa-www.sock" first
[Thu, 04 Jul 2013 10:41:00 GMT] DEBUG Going to start 1 Workers
[Thu, 04 Jul 2013 10:41:00 GMT] INFO Starting Worker 1 (PID): 25334
[Thu, 04 Jul 2013 10:41:00 GMT] INFO Server started on socket "/tmp/varankinv-legoa-www.sock"
[Thu, 04 Jul 2013 10:41:00 GMT] DEBUG Worker connected to /tmp/varankinv-legoa-www.sock:-1
```

Открываем в браузере http://legoa.varankinv.coal.dev.yandex-team.ru

Proof it!

##### 4.1 Запускаем локально

Если хочется разрабатываться локально, необходимо запускать приложение TCP-порте вместо сокета. Для этого в конфиге 
`configs/current/node.js` заменить параметр `app.socket`, на `app.port`:

```diff
diff --git a/configs/development/node.js b/configs/development/node.js
index f4a6c9c..4c6c6ab 100644
--- a/configs/development/node.js
+++ b/configs/development/node.js
@@ -7,8 +7,8 @@ var OS = require('os'),
 module.exports = {
     debug : true,
     app : {
-        //port : 3014,
-        socket : socketPath,
+        port : 3042,
+        //socket : socketPath,
         workers : 1
     },
```

Так же необходимо позаботится о раздаче статики (JS/CSS). Например, для этих целей, можно использовать bem-server.

Прописываем хост статического сервера в конфиге `configs/current/hosts.js`:

```diff
diff --git a/configs/development/hosts.js b/configs/development/hosts.js
index 258681f..3eeb315 100644
--- a/configs/development/hosts.js
+++ b/configs/development/hosts.js
@@ -13,7 +13,7 @@ module.exports = {
         host : 'http://center.yandex-team.ru'
     },
     static : {
-        host : ''
+        host : 'http://127.0.0.1:8000'
     },
```

Запускам bem-server на порту 8000, и отправляем его «в фон»:

```
% bem server -p 800 -v warn &
```

Стартуем приложение:

```
% npm start

[...]

[Thu, 04 Jul 2013 10:56:52 GMT] INFO Server started on port "3014"
[Thu, 04 Jul 2013 10:56:52 GMT] DEBUG Worker connected to 0.0.0.0:3014
```

Проверяем http://127.0.0.1:3042

P.S. В качестве сервера статики можно также (попробовать ;) использовать `SimpleHTTPServer` из Python:

```
% python -m SimpleHTTPServer &

  › Serving HTTP on 0.0.0.0 port 8000 ...
```

### Эксплуатация ###

#### Контакты

@lego-team:

* [@varankinv](http://staff/varankinv)
* [@bemer](http://staff/bemer)

По вопросам эксплуатации тестинга/продакшна: @tools-admin

* [@dukeartem](http://staff/dukeartem)
* [@zivot](http://staff/zivot)

По вопросам эксплуатации coal.dev: @corba-admin

#### Кондуктор

Проект состоит из набора пакетов в репозитории `verstka`:

* [yandex-legoa-www](http://c.yandex-team.ru/packages/yandex-legoa-www/) — код приложения, конфиги, верстка
* [yandex-legoa-www-static](http://c.yandex-team.ru/packages/yandex-legoa-www-static/) — статика
* [yandex-legoa-tools](http://c.yandex-team.ru/packages/yandex-legoa-tools) — всякие утилиты (конфиги 
  для monrun, graphite-client, и пр.)
* [yandex-legoa-data](http://c.yandex-team.ru/packages/yandex-legoa-data/) — данные

#### Тестинг

http://lego01ht.cs-minitools01ht.yandex.ru/

### Заметки ###

#### Фаловая структура

    # Хранилище

    datasrc/
      .bem/
        cache/
          # каждую библиотеку (и ее депенды) сливаем в кеш плоским списком (1)
          025b3385f5538eca3f2fffed4d375aef9cc4d329/
          345a0e972d28d19623a2f0ee1910857b806f5434/
          3717c40df3d5afa17ca728774d2c32dbceb61030/
          ...
        make.js

      # документацию к библиотеки (из данных кеша) собираем в директории `_{{имя-библиотеки}}` (2)

      _islands-popups/
        blocks/
          popup.data.json
          dropdown.json.js
          ...
        examples/
          popup.examples/
            .bem/level.js   # baseLevelPath ➝ путь/до/библиотеки/в/кэше/.bem/levels/bundles.js (FIXME: hardcode)
            10-simple/
              10-simple.bemjson.js
          ...

###### Примечания

**1) Ключ в кеше должен быть хеш-суммой от данных библиотеки (url+treeish), чтобы депенды одной
библиотеки не аффектили других**

Внутренние депенды библиотек (`islands-controls➝bem-controls`) заменяем на `type=symlink`
с относительным путем в кеш. Это должно сократить общее время на сборку всего. Плюс, независимо
от того как устроенна библиотека, интроспекция по библеотеке будет продолжать работать: ссылки
на уровни, технологии и пр.

**2) В `blocks` складываем собранную по-уровням документацию каждого блока библиотеки
в JSON-формате.**

Полученный JSON загружается в рантайме и через `bemtree.xjst` + `bemhtml` генерируется страница.

**3) В `examples` собираем примеры библиотеки.**

Сборка примеров запускается в отдельном child-процессе, на основе make.js-файла библиотеки 
(с доопределением нужных узлов).

Для запуска сборки реализуем [мини-bem-make](datasrc/lib/make.js), который умеет возвращать 
архитектуру сборки по умолчанию (`DefaultArch`) для библиотеки. Но с возможностью програмно 
влиять на конечный `Arch` из кода воркера, запускающего процесс сборки.

Остальные заметки: [в WIKI](http://wiki.yandex-team.ru/lego/site/notes)

