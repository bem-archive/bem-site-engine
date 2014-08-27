# Обзор middleware модулей

Код middleware модулей bem-site-engine лежит в директории [middleware](./src/blocks/server.blocks/middleware).

Как и весь серверный код bem-site-engine они реализованы с помощью библиотеки [ymodules](https://github.com/ymaps/modules).
Такой подход дает возможность гибкого расширения и переопределения каждого middleware модуля
с помощью введения собственных уровней переопределения.

Архитектура bem-site-engine также дает возможность определять свой набор middleware модулей
которые будут перехватывать запросы при работе сервера и указывать их порядок:

```
modules.define('middleware', [
        'middleware__locale',
        'middleware__logger',
        'middleware__proxy-example',
        'middleware__slashes',
        'middleware__router',
        'middleware__page-title',
        'middleware__page-meta',
        'middleware__page-menu',
        'middleware__lang-switcher',
        'middleware__page',
        'middleware__error'
    ],
    function(provide, locale, logger, proxyExample, slashes, router, pageTitle, pageMeta, pageMenu, langSwitcher, page, error) {

        return provide(function() {
            return [
                locale,
                logger,
                proxyExample,
                slashes,
                router,
                pageTitle,
                pageMeta,
                pageMenu,
                langSwitcher,
                page,
                error
            ];
        });
    }
);
```

Здесь возвращаемое значение представляет собой массив middleware модулей, которые будут отрабатывать
в том порядке в котором они перечислены в данном массиве.

### locale

Расположение: `/src/blocks/server.blocks/middleware/__locale`.

Модуль, для определения локали запроса.

### logger

Расположение: `/src/blocks/server.blocks/middleware/__logger`.

Модуль, для логгирования запроса.
Сейчас для логгирования информации о запросе используется логгер [intel](https://www.npmjs.org/package/intel). 

### proxyExample

Расположение: `/src/blocks/server.blocks/middleware/__proxy-example`.

Модуль, для проксирования запросов для примеров библиотек блоков на github репозиторий.

### slashes

Расположение: `/src/blocks/server.blocks/middleware/__slashes`.

### router

Расположение: `/src/blocks/server.blocks/middleware/__router`.

### pageTitle

Расположение: `/src/blocks/server.blocks/middleware/__page-title`.

Модуль для построения аттрибут `title` элемента `head` страницы.

Сейчас этот модуль работает следующим образом:

Title формируется как строка, представляющая собой значение всех аттрибутов `title` 
начиная от текущего узла и до корня дерева модели (с учетом выбранной локали)
с добавленным суффиксом которым является значение параметра `title` в конфигурации приложения.

Title-ы всех узлов разделены разделителем в виде `/` и окружающих его пробельных символов.

Например title для данной страницы: `Описание middleware модулей / Документация / Название приложения`

Здесь:

* `Описание middleware модулей` - title текущего узла к которому привязан данный `*.md` документ.
* `Документация` - title родительского узла.
* `Название приложения` - значение параметра title из конфигурации приложения.

```
"title": {
    "en": "Your application title",
    "ru": "Название приложения"
},
```

### pageMeta

Расположение: `/src/blocks/server.blocks/middleware/__page-meta`.

Модуль для построения аттрибута `meta` элемента `head` страницы.

Поля мета-информации определяются по данным текущего активного узла модели.

Если активный узел не имеет привязанного ресурса, то мета-информация имеет 2 аттрибута:

* `<meta name="description" content="...">` - определяется как значение аттрибута `title` текущего узла
с учетом выбранной локализации.
* `<meta property="og:url" content="...">` - определяется как значение аттрибута `url` для текущего узла.

Если активный узел имеет привязанный ресурс, то мета-информация дополнительно содержит поля:

* `<meta property="og:description" content="...">` - определяется как значение аттрибута `title` ресурса,
связанного с текущим узлом.
* `<meta name="keywords" content="...">` - содержит перечень тегов связанных с ресурсом, связанным с текущим узлом.
* `<meta property="og:type" content="article">` - тип `article`
* `<meta property="og:article:tag" content="">` - совпадает с аттрибутом keywords мета-информации

### pageMenu

Расположение: `/src/blocks/server.blocks/middleware/__page-menu`.

### langSwitcher

Расположение: `/src/blocks/server.blocks/middleware/__lang-switcher`.

### page

Расположение: `/src/blocks/server.blocks/middleware/__page`.

### error

Расположение: `/src/blocks/server.blocks/middleware/__error`.
