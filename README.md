legoa
=====

Сайт Лего-плафтормы

http://legoa.test.yandex-team.ru/

## Как поднять копию ##

### 1. Клонируем репозиторий

```
% git clone -b dev git://<...>/legoa-www.git ~/web/legoa
% cd ~/web/legoa
% git submodule init && git submodule update
```

### 2. Устанавливаем зависимости

```
% npm install
% bem make libs
```

### 3. Собираем

```
% bem make desktop.bundles
```

### 4. Запускаем

Из коробки, проект ожидает, что он будет запущен в связке с Nginx-сервером который будет слушать сокет,
поднятый node.js-приложением, а так же отвечать за раздачу статики.

Вся необходимая инфраструктура для разработки уже настроена на dev-сервере `coal.dev.yandex.net`: на сервере
крутится Nginx, слушающий запросы вида `<project>.<user>.coal.dev.yandex-team.ru`. Для каждого такого запроса, сервер
ожидает что, корень проекта (`root`) будет находиться в `/home/$user/web/$project` и попытается проксировать запросы
в сокет по пути: `http://unix:/tmp/$user-$project-www.sock`.

*По вопросам связанными с `coal.dev` обращаться к @varankinv*

Запускаем Node.js-приложение:

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

#### 4.1 Запускаем локально

Если хочется разрабатываться локально, необходимо запускать приложение TCP-порте, вместо сокета. Для этого случая
необходимо использовать набор конфигов `local`, которые обеспечивают старт приложения на порту `process.env.PORT`
(по умолчанию 3014):

```
% ln -snf configs/local current
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
+        host : 'http://127.0.0.1:8001'
     },
```

Запускам bem-server на порту 8001, и отправляем его «по тихому в фон»:

```
% bem server -p 8001 -v warn &
```

Стартуем приложение:

```
% PORT=5001 npm start

[...]

[Thu, 04 Jul 2013 10:56:52 GMT] INFO Server started on port "5001"
[Thu, 04 Jul 2013 10:56:52 GMT] DEBUG Worker connected to 0.0.0.0:5001
```

Проверяем http://127.0.0.1:5001

P.S. В качестве сервера статики можно также (попробовать ;) использовать `SimpleHTTPServer` из Python, чтобы
статика не пересобиралась на каждый запрос:

```
% python -m SimpleHTTPServer 8001 &

  › Serving HTTP on 0.0.0.0 port 8001 ...
```

### 5. Собираем данные

TODO: подробнее описать, как собрать `datasrc` с данными islands-библиотек

*Основной код сборщика данных, находится в проекте [legoa-data](http://github.yandex-team.ru/lego/legoa-data) 
и подключается в проект [сабмодулем](http://git-scm.com/book/en/Git-Tools-Submodules) на этапе разработки 
(см. п. 1 про `git submodule ...`).*

#### Собрать весь `datasrc`

**Долго и скучно**

```
% make -C datasrc
```

#### Собрать по-кусочкам

**Молча, без объяснений**

```
% cd datasrc
% npm install
% bem make libs
```

Далее точечно:

* одну библиотеку

```
% bem make _islands-icons
```

* только документацию на библиотеку

```
% bem make _islands-icons/blocks
```

* только примеры библиотеки

```
% bem make _islands-icons/examples
```

## Эксплуатация ##

### Контакты

@lego-team:

* [@varankinv](http://staff/varankinv)
* [@bemer](http://staff/bemer)

По вопросам эксплуатации тестинга/продакшна: @tools-admin

* [@dukeartem](http://staff/dukeartem)
* [@zivot](http://staff/zivot)

По вопросам эксплуатации coal.dev: @corba-admin

### Кондуктор

Проект состоит из набора пакетов в репозитории `verstka`:

* [yandex-legoa-www](http://c.yandex-team.ru/packages/yandex-legoa-www/) — код приложения, конфиги, верстка
* [yandex-legoa-www-static](http://c.yandex-team.ru/packages/yandex-legoa-www-static/) — статика
* [yandex-legoa-tools](http://c.yandex-team.ru/packages/yandex-legoa-tools) — всякие утилиты (конфиги
  для monrun, graphite-client, и пр.)
* [yandex-legoa-data](http://c.yandex-team.ru/packages/yandex-legoa-data/) — данные.

### Тестинг

* http://legoa.test.yandex-team.ru/
* http://lego01ht.cs-minitools01ht.yandex.ru/ (*если вдруг надо будет тестировать `*.yandex.ru`-куки*).

## Бюрократия ##

### Проект в Планере 

* http://planner.yandex-team.ru/project/10690

## Заметки ###

### Фаловая структура

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

##### Примечания

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

