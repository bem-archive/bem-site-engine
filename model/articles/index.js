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

            },
            ru: {

            }
        }
        //source: "https://github.com/bem/bem-method/tree/bem-info-data/articles/bem-js-main-terms"
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

            },
            ru: {

            }
        }
        //source: "https://github.com/bem/bem-method/tree/bem-info-data/articles/yamapsbem"
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

            },
            ru: {

            }
        }
        //source: "https://github.com/AndreyGeonya/firmCardStory/tree/master/docs/firm-card-story"
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

            },
            ru: {

            }
        }
        //source: "https://github.com/bem/bem-method/tree/bem-info-data/articles/borschik"
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

            },
            ru: {

            }
        }
        //source: "https://github.com/bem/bem-method/tree/bem-info-data/articles/smartcd"
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

            },
            ru: {

            }
        }
        //source: "https://github.com/bem/bem-method/tree/bem-info-data/articles/yandex-frontend-dev"
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

            },
            ru: {

            }
        }
        //source: "https://github.com/tormozz48/bem-core/tree/b1.1.0/common.docs/bemhtml-cache-experimental"
    };
};
