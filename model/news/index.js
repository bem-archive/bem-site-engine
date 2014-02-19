module.exports = {
    get: function() {
        return {
            title: {
                en: "Blog",
                ru: "Блог"
            },
            route: {
                name: "news",
                pattern: "/news(/<id>)(/)"
            },
            items: [
                getNewBeminfoSite(),
                getBemupYac2013(),
                getBemTools064(),
                getBemupTalks(),
                getBemupPromo(),
                getBemComponents(),
                getBemComponents(),
                getBemup(),
                getBemCli(),
                getBemTools0533(),
                getAnygridBemNotations(),
                get201302MaintainableFrontendDevWithBem(),
                get201302BemGoesToIndia()
            ]
        };
    }
};

var getNewBeminfoSite = function() {
    return {
        title: {
            en: "New bem.info",
            ru: "Новый bem.info"
        },
        route: {
            conditions: {
                id: "new-beminfo-site"
            }
        },
        content: {
            en: {
                title: "New bem.info",
                createDate: "21-11-2013",
                editDate: "",
                summary: "Brand new bem.info with node.js and bemtree inside",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/new-beminfo-site/new-beminfo-site.en.md"
            },
            ru: {
                title: "Новый bem.info",
                createDate: "21-11-2013",
                editDate: "",
                summary: "Новый bem.info: теперь на node.js и bemtree",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/new-beminfo-site/new-beminfo-site.ru.md"
            }
        }
    };
};

var getBemupYac2013 = function() {
    return {
        title: {
            en: "Announcement of Second BEM Meetup!",
            ru: "Анонс: Второй BEMup — в рамках YaC 2013"
        },
        route: {
            conditions: {
                id: "bemup-yac2013"
            }
        },
        content: {
            en: {
                title: "Announcement of Second BEM Meetup!",
                createDate: "06-09-2013",
                editDate: "",
                summary: "Second BEMup - during YaC 2013!",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","BEM","BEMup"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/bemup-yac2013/bemup-yac2013.en.md"
            },
            ru: {
                title: "Анонс: Второй BEMup — в рамках YaC 2013",
                createDate: "06-09-2013",
                editDate: "",
                summary: "На YaC 2013, в рамках которого 2 октября 2013 года в павильоне фронтенда пройдет второй BEMup.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","BEM","BEMup"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/bemup-yac2013/bemup-yac2013.ru.md"
            }
        }
    };
};

var getBemTools064 = function() {
    return {
        title: {
            en: "bem-tools v0.6.4",
            ru: "Версия bem-tools 0.6.4"
        },
        route: {
            conditions: {
                id: "bem-tools-0-6-4"
            }
        },
        content: {
            en: {
                title: "bem-tools v0.6.4",
                createDate: "02-07-2013",
                editDate: "21-08-2013",
                summary: "The stable bem-tools v0.6.4 is available.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","bem-tools"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/bem-tools-0-6-4/bem-tools-0-6-4.en.md"
            },
            ru: {
                title: "Версия bem-tools 0.6.4",
                createDate: "02-07-2013",
                editDate: "21-08-2013",
                summary: "Стабильная версия bem-tools 0.6.4 доступна.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","bem-tools"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/bem-tools-0-6-4/bem-tools-0-6-4.ru.md"
            }
        }
    };
};

var getBemupTalks = function() {
    return {
        title: {
            en: "First BEMup Talks Archive",
            ru: "Видео докладов первого BEMup'а"
        },
        route: {
            conditions: {
                id: "bemup-talks"
            }
        },
        content: {
            en: {
                title: "First BEMup Talks Archive",
                createDate: "20-08-2013",
                editDate: "",
                summary: "Videos from the first BEMup, that took place in Moscow on August 2, 2013.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","BEM","BEMup"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/bemup-talks/bemup-talks.en.md"
            },
            ru: {
                title: "Видео докладов первого BEMup'а",
                createDate: "20-08-2013",
                editDate: "",
                summary: "2 августа 2013 года в московском Яндексе прошел первый митап по БЭМ — BEMup!.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","BEM","BEMup"],
                "categories": [],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/bemup-talks/bemup-talks.ru.md"
            }
        }
    };
};

var getBemupPromo = function() {
    return {
        title: {
            en: "BEMup — Watch It, Feel It!",
            ru: "BEMup — как это было"
        },
        route: {
            conditions: {
                id: "bemup-promo"
            }
        },
        content: {
            en: {
                title: "BEMup — Watch It, Feel It!",
                createDate: "13-08-2013",
                editDate: "20-08-2013",
                summary: "BEMup, our first meetup about BEM was on August 2, in the Moscow office of Yandex.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","BEM","BEMup"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/bemup-promo/bemup-promo.en.md"
            },
            ru: {
                title: "BEMup — как это было",
                createDate: "13-08-2013",
                editDate: "20-08-2013",
                summary: "2 августа в московском Яндексе прошел первый митап по БЭМ — BEMup!.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","BEM","BEMup"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/bemup-promo/bemup-promo.ru.md"
            }
        }
    };
};

var getBemComponents = function() {
    return {
        title: {
            en: "Rename of 'bem-controls' to 'bem-components'",
            ru: "Переименование bem-controls в bem-components"
        },
        route: {
            conditions: {
                id: "bem-components"
            }
        },
        content: {
            en: {
                title: "Rename of 'bem-controls' to 'bem-components'",
                createDate: "05-08-2013",
                editDate: "",
                summary: "According to plan, we renamed the bem-controls repository to bem-components.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/bem-components/bem-components.en.md"
            },
            ru: {
                title: "Переименование bem-controls в bem-components",
                createDate: "05-08-2013",
                editDate: "",
                summary: "Мы переименовали репозиторий bem-controls в bem-components.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/bem-components/bem-components.ru.md"
            }
        }
    };
};

var getBemup = function() {
    return {
        title: {
            en: "Announcement of First BEM Meetup!",
            ru: "Анонс: BEMup — первый митап по БЭМ!"
        },
        route: {
            conditions: {
                id: "bemup"
            }
        },
        content: {
            en: {
                title: "Announcement of First BEM Meetup!",
                createDate: "23-07-2013",
                editDate: "",
                summary: "Meetup will take place in Moscow on August 2, 2013.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","BEM","BEMup"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/bemup/bemup.en.md"
            },
            ru: {
                title: "Анонс: BEMup — первый митап по БЭМ!",
                createDate: "23-07-2013",
                editDate: "05-08-2013",
                summary: "2 августа 2013 года, в пятницу, в московском Яндексе состоится первый митап по БЭМ!.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","BEM","BEMup"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/bemup/bemup.ru.md"
            }
        }
    };
};

var getBemCli = function() {
    return {
        title: {
            en: "bem-cli: Launch bem-tools Locally",
            ru: "bem-cli: запусти bem-tools локально"
        },
        route: {
            conditions: {
                id: "bem-cli"
            }
        },
        content: {
            en: {
                title: "bem-cli: Launch bem-tools Locally",
                createDate: "09-07-2013",
                editDate: "",
                summary: "Mikhail Davydov wrote a tool called bem-cli that launches locally installed bem-tools.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","tools","bem-tools"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/bem-cli/bem-cli.en.md"
            },
            ru: {
                title: "bem-cli: запусти bem-tools локально",
                createDate: "09-07-2013",
                editDate: "",
                summary: "Михаил Давыдов написал инструмент bem-cli, который может запускать локально установленный bem-tools.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","tools","bem-tools"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/bem-cli/bem-cli.ru.md"
            }
        }
    };
};

var getBemTools0533 = function() {
    return  {
        title: {
            en: "bem-tools v0.5.33",
            ru: "Версия bem-tools 0.5.33"
        },
        route: {
            conditions: {
                id: "bem-tools-0-5-33"
            }
        },
        content: {
            en: {
                title: "bem-tools v0.5.33",
                createDate: "02-07-2013",
                editDate: "",
                summary: "Stable release bem-tools v0.5.33.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","bem-tools"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/bem-tools-0-5-33/bem-tools-0-5-33.en.md"
            },
            ru: {
                title: "Версия bem-tools 0.5.33",
                createDate: "02-07-2013",
                editDate: "03-07-2013",
                summary: "Стабильная версия bem-tools 0.5.33.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","bem-tools"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/bem-tools-0-5-33/bem-tools-0-5-33.ru.md"
            }
        }
    };
};

var getAnygridBemNotations = function() {
    return {
        title: {
            en: "AnyGrid – CSS Grids Generator that Uses BEM-Notations and etc!",
            ru: "Генератор сеток AnyGrid для CSS в БЭМ-нотациях и многого другого!"
        },
        route: {
            conditions: {
                id: "anygrid-bem-notations"
            }
        },
        content: {
            en: {
                title: "AnyGrid – CSS Grids Generator that Uses BEM-Notations and etc!",
                createDate: "18-06-2013",
                editDate: "",
                summary: "Vasya Aksyonov developed a great project — CSS Grids Generator called AnyGrid.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["css","news"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/anygrid-bem-notations/anygrid-bem-notations.en.md"
            },
            ru: {
                title: "Генератор сеток AnyGrid для CSS в БЭМ-нотациях и многого другого!",
                createDate: "18-06-2013",
                editDate: "",
                summary: "Вася Аксёнов написал вот такой крутой проект — генератор сеток AnyGrid.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","css"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/anygrid-bem-notations/anygrid-bem-notations.ru.md"
            }
        }
    };
};

var get201302MaintainableFrontendDevWithBem = function() {
    return {
        title: {
            en: "BEM at MetaRefresh 2013",
            ru: "БЭМ на MetaRefresh 2013"
        },
        route: {
            conditions: {
                id: "2013-02-maintainable-frontend-dev-with-bem"
            }
        },
        content: {
            en: {
                title: "BEM at MetaRefresh 2013",
                createDate: "22-02-2013",
                editDate: "",
                summary: "In this presentation given at MetaRefresh 2013 in Bangalore you will learn more about BEM and how this actually works.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","BEM"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/2013-02-maintainable-frontend-dev-with-bem/2013-02-maintainable-frontend-dev-with-bem.en.md"
            },
            ru: {
                title: "БЭМ на MetaRefresh 2013",
                createDate: "22-02-2013",
                editDate: "",
                summary: "Подробности о том, что такое БЭМ и как работает этот подход, вы узнаете из доклада Варвары Степановой на конференции MetaRefresh 2013 в Бангалоре.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","BEM"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/2013-02-maintainable-frontend-dev-with-bem/2013-02-maintainable-frontend-dev-with-bem.ru.md"
            }
        }
    };
};

var get201302BemGoesToIndia = function() {
    return {
        title: {
            en: "BEM goes to India",
            ru: "БЭМ едет в Индию"
        },
        route: {
            conditions: {
                id: "2013-02-bem-goes-to-india"
            }
        },
        content: {
            en: {
                title: "BEM goes to India",
                createDate: "12-02-2013",
                editDate: "",
                summary: "Maintainable Fronted Development with BEM at Meta Refresh 2013 in India.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","BEM"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/2013-02-bem-goes-to-india/2013-02-bem-goes-to-india.en.md"
            },
            ru: {
                title: "БЭМ едет в Индию",
                createDate: "12-02-2013",
                editDate: "",
                summary: "Разработка «без потерь» по БЭМ на конференции Meta Refresh 2013 в Индии.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["news","BEM"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/news/2013-02-bem-goes-to-india/2013-02-bem-goes-to-india.ru.md"
            }
        }
    };
};

