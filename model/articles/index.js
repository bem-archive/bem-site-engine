module.exports = {
    get: function() {
        return {
            title: {
                en: "Articles",
                ru: "Статьи"
            },
            route: {
                name: "articles",
                pattern: "/articles(/<id>)(/)"
            },
            items: [
                getStartWithProjectStub(),
                getBemJsMainTerms(),
                getYaMapsBem(),
                getFirmCardStory(),
                getBorschik(),
                getSmartCd(),
                getYandexFrontendDev(),
                getBemhtmlCacheExperimental()
            ]
        };
    }
};

var getStartWithProjectStub = function() {
    return {
        title: {
            en: "Full stack quick start",
            ru: "Попробуй БЭМ на вкус"
        },
        route: {
            conditions: {
                id: "start-with-project-stub"
            }
        },
        source: {
            en: {
                title: "Full stack quick start",
                createDate: "12-02-2013",
                editDate: "30-04-2013",
                summary: "This article shows you how to develop an online shop web page using BEM principles in CSS, JavaScript and BEMHTML templates.",
                thumbnail: "",
                authors: ["stepanova-varvara"],
                tags: ["BEM", "bem-tools","tools","i-bem"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/articles/start-with-project-stub/start-with-project-stub.en.md"
            },
            ru: {
                title: "Попробуй БЭМ на вкус!",
                createDate: "12-12-12",
                editDate: "",
                summary: "Эта статья рассказывает о том, как создать проект с использованием БЭМ-технологий.",
                thumbnail: "",
                authors: ["stepanova-varvara"],
                tags: ["BEM", "bem-tools","tools","i-bem"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/articles/start-with-project-stub/start-with-project-stub.ru.md"
            }
        }
    };
};

var getBemJsMainTerms = function() {
    return {
        title: {
            en: "JavaScript for BEM: The Main Terms",
            ru: "JavaScript по БЭМ: основные понятия"
        },
        route: {
            conditions: {
                id: "bem-js-main-terms"
            }
        },
        source: {
            en: {
                title: "JavaScript for BEM: The Main Terms",
                createDate: "16-07-2013",
                editDate: "",
                summary: "How to write client side JS using i-bem.js from bem-bl library.",
                thumbnail: "",
                authors: ["stepanova-varvara"],
                tags: ["i-bem.js", "JavaScript"],
                translators: ["nekhaieva-aleksandra"],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/articles/bem-js-main-terms/bem-js-main-terms.en.md"
            },
            ru: {
                title: "JavaScript по БЭМ: основные понятия",
                createDate: "27-03-2013",
                editDate: "16-07-2013",
                summary: "В стеке БЭМ-технологий есть блок i-bem библиотеки bem-bl. Его JavaScript-реализация использует предметную область БЭМ и позволяет насладиться всеми преимуществами разработки по принципам БЭМ не только программируя внешний вид компонент, но и их поведение.",
                thumbnail: "",
                authors: ["stepanova-varvara"],
                tags: ["i-bem.js", "JavaScript"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/articles/bem-js-main-terms/bem-js-main-terms.ru.md"
            }
        }
    };
};

var getYaMapsBem = function() {
    return {
        title: {
            en: "Yandex.Maps API and BEM",
            ru: "API Яндекс Карт и БЭМ"
        },
        route: {
            conditions: {
                id: "yamapsbem"
            }
        },
        source: {
            en: {
                title: "Yandex.Maps API and BEM",
                createDate: "17-07-2013",
                editDate: "18-07-2013",
                summary: "Creation of the menu to show on a map different types of POI (geoobject collections) with help of Yandex.Maps API and BEM methodology.",
                thumbnail: "",
                authors: ["hananein-denis"],
                tags: ["BEM", "API"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/articles/yamapsbem/yamapsbem.en.md"
            },
            ru: {
                title: "API Яндекс.Карт и БЭМ",
                createDate: "17-07-2013",
                editDate: "19-07-2013",
                summary: "Cоздание меню для показа на карте организаций различных типов используя API Яндекс.Карт и БЭМ методологию.",
                thumbnail: "",
                authors: ["hananein-denis"],
                tags: ["BEM", "API"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/articles/yamapsbem/yamapsbem.ru.md"
            }
        }
    };
};

var getFirmCardStory = function() {
    return {
        title: {
            en: "BEM application on Leaflet and 2GIS API",
            ru: "БЭМ-приложение на Leaflet и API 2GIS"
        },
        route: {
            conditions: {
                id: "firm-card-story"
            }
        },
        source: {
            en: {
                title: "BEM application on Leaflet and 2GIS API",
                createDate: "09-07-2013",
                editDate: "11-07-2013",
                summary: "An example of a simple map service built using the BEM methodology.",
                thumbnail: "",
                authors: ["geonya-andrey"],
                tags: ["BEM","API"],
                translators: ["nekhaieva-aleksandra"],
                content: "https://github.com/AndreyGeonya/firmCardStory/tree/master/docs/firm-card-story/firm-card-story.en.md"
            },
            ru: {
                title: "БЭМ-приложение на Leaflet и API 2GIS",
                createDate: "23-11-2012",
                editDate: "11-07-2013",
                summary: "Пример реализации несложного картографического сервиса по БЭМ-методологии.",
                thumbnail: "",
                authors: ["geonya-andrey"],
                tags: ["BEM","API"],
                translators: [],
                content: "https://github.com/AndreyGeonya/firmCardStory/tree/master/docs/firm-card-story/firm-card-story.ru.md"
            }
        }
    };
};

var getBorschik = function() {
    return {
        title: "borschik",
        route: {
            conditions: {
                id: "borschik"
            }
        },
        source: {
            en: {
                title: "borschik",
                createDate: "22-04-2013",
                editDate: "04-07-2013",
                summary: "borschik is a simple but powerful builder for text-based file formats.",
                thumbnail: "",
                authors: ["androsov-alexey"],
                tags: ["tools","borschik"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/articles/borschik/borschik.en.md"
            },
            ru: {
                title: "borschik",
                createDate: "22-04-2013",
                editDate: "04-07-2013",
                summary: "borschik — простой, но мощный сборщик файлов текстовых форматов.",
                thumbnail: "",
                authors: ["androsov-alexey"],
                tags: ["tools","borschik"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/articles/borschik/borschik.ru.md"
            }
        }
    };
};

var getSmartCd = function() {
    return {
        title: {
            "en": "smartcd: how to launch tools locally",
            "ru": "smartcd: локальный запуск инструментов"
        },
        route: {
            conditions: {
                id: "smartcd"
            }
        },
        source: {
            en: {
                title: "smartcd: how to launch tools locally",
                createDate: "19-06-2013",
                editDate: "25-06-2013",
                summary: "Find out how you can launch bem-tools faster right from the command line using smartcd.",
                thumbnail: "",
                authors: ["belov-sergey"],
                tags: ["bem-tools","tools"],
                translators: ["nekhaieva-aleksandra"],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/articles/smartcd/smartcd.en.md"
            },
            ru: {
                title: "smartcd: локальный запуск инструментов",
                createDate: "13-06-2013",
                editDate: "25-06-2013",
                summary: "Узнайте, как с помощью smartcd можно быстрее запустить bem-tools из коммандной строки.",
                thumbnail: "",
                authors: ["belov-sergey"],
                tags: ["bem-tools","tools"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/articles/smartcd/smartcd.ru.md"
            }
        }
    };
};

var getYandexFrontendDev = function() {
    return {
        title: "What you can borrow from Yandex frontend dev",
        route: {
            conditions: {
                id: "yandex-frontend-dev"
            }
        },
        source: {
            en: {
                title: "What you can borrow from Yandex frontend dev",
                createDate: "18-02-2013",
                editDate: "30-04-2013",
                summary: "The article sums up Yandex over 7-year experience in finding solutions for efficient frontend development.",
                thumbnail: "",
                authors: ["stepanova-varvara"],
                tags: ["BEM"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/articles/yandex-frontend-dev/yandex-frontend-dev.en.md"
            },
            ru: {
                title: "What you can borrow from Yandex frontend dev",
                createDate: "18-02-2013",
                editDate: "",
                summary: "This article shows you how to develop an online shop web page using BEM principles in CSS, JavaScript and BEMHTML templates. Статья доступна на английском языке.",
                thumbnail: "",
                authors: ["stepanova-varvara"],
                tags: ["BEM"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/articles/yandex-frontend-dev/yandex-frontend-dev.ru.md"
            }
        }
    };
};

var getBemhtmlCacheExperimental = function() {
    return {
        title: "Bemhtml cache experimental",
        route: {
            "conditions": {
                "id": "bemhtml-cache-experimental"
            }
        },
        hidden: ["ru"],
        source: {
            en: {
                title: "Bemhtml cache experimental",
                createDate: "11-06-2013",
                editDate: "",
                summary: "Cache parts of BEMHTML page by declaring cache keys in BEMJSON.",
                thumbnail: "",
                authors: ["indutny-fedor"],
                tags: ["API"],
                translators: ["jetpyspayeva-yelena"],
                content: "https://github.com/tormozz48/bem-core/tree/b1.1.0/common.docs/bemhtml-cache-experimental/bemhtml-cache-experimental.en.md"
            }
        }
    };
};
